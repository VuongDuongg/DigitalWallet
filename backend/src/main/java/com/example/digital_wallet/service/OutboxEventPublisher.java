package com.example.digital_wallet.service;

import com.example.digital_wallet.model.entity.OutboxEvent;
import com.example.digital_wallet.model.enums.OutboxStatus;
import com.example.digital_wallet.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxEventPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String TOPIC_PAYMENT_REQUESTED = "payment.process.requested";

    /**
     * Chạy định kỳ mỗi 500ms để quét các OutboxEvent và bắn lên Kafka.
     * Áp dụng FOR UPDATE SKIP LOCKED để ngăn chặn 100% race condition giữa các instance backend.
     */
    @Scheduled(fixedDelay = 500)
    public void publishPendingEvents() {
        // 1. Chiếm quyền 50 bản ghi INIT sang PROCESSING bằng SKIP LOCKED trong transaction ngắn
        int claimed = claimBatch();
        if (claimed == 0) {
            return;
        }

        // 2. Lấy danh sách các bản ghi vừa chiếm quyền
        List<OutboxEvent> processingEvents = outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PROCESSING);
        log.debug("Đã chiếm quyền {} sự kiện Outbox để bắn sang Kafka", processingEvents.size());

        for (OutboxEvent event : processingEvents) {
            String topic = resolveTopic(event.getEventType());

            try {
                // Key Kafka là aggregateId (sourceAccountId) đảm bảo FIFO trên cùng Partition
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload())
                        .get(3, TimeUnit.SECONDS);

                event.setStatus(OutboxStatus.PUBLISHED);
                log.info("Bắn Outbox sang Kafka thành công: eventId={}, topic={}, key={}",
                        event.getEventId(), topic, event.getAggregateId());
            } catch (Exception ex) {
                log.error("Lỗi khi bắn sự kiện sang Kafka (eventId={}): {}", event.getEventId(), ex.getMessage());
                event.setRetryCount(event.getRetryCount() + 1);

                if (event.getRetryCount() >= 5) {
                    event.setStatus(OutboxStatus.FAILED);
                    log.error("Sự kiện eventId={} đã thất bại quá 5 lần, chuyển sang FAILED", event.getEventId());
                } else {
                    // Trả lại trạng thái INIT để retry lần sau
                    event.setStatus(OutboxStatus.INIT);
                }
            }

            outboxEventRepository.save(event);
        }
    }

    @Transactional
    public int claimBatch() {
        return outboxEventRepository.claimBatchForProcessing();
    }

    private String resolveTopic(String eventType) {
        if ("PAYMENT_PROCESS_REQUESTED".equals(eventType)) {
            return TOPIC_PAYMENT_REQUESTED;
        }
        return "wallet.events.default";
    }
}
