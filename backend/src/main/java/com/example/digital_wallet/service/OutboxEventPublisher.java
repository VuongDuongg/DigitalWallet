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
     * Chạy định kỳ mỗi 500ms để quét các OutboxEvent có trạng thái INIT và bắn lên Kafka.
     * Sử dụng partial index 'idx_outbox_status' trên PostgreSQL giúp câu query chỉ mất ~0.1ms.
     */
    @Scheduled(fixedDelay = 500)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.INIT);

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.debug("Tìm thấy {} sự kiện Outbox đang chờ gửi sang Kafka", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            String topic = resolveTopic(event.getEventType());

            try {
                // Gửi message lên Kafka: Key là aggregateId (đảm bảo message cùng giao dịch rơi vào cùng 1 Partition)
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload())
                        .get(3, TimeUnit.SECONDS); // Chờ ACK từ Kafka tối đa 3 giây

                event.setStatus(OutboxStatus.PUBLISHED);
                log.info("Đã bắn sự kiện Outbox thành công lên Kafka: eventId={}, topic={}, aggregateId={}",
                        event.getEventId(), topic, event.getAggregateId());
            } catch (Exception ex) {
                log.error("Lỗi khi bắn sự kiện sang Kafka (eventId={}): {}", event.getEventId(), ex.getMessage());
                event.setRetryCount(event.getRetryCount() + 1);

                // Sau 5 lần retry thất bại, đánh dấu FAILED để xem xét Dead-Letter Queue
                if (event.getRetryCount() >= 5) {
                    event.setStatus(OutboxStatus.FAILED);
                    log.error("Sự kiện eventId={} đã thất bại quá 5 lần, chuyển trạng thái sang FAILED", event.getEventId());
                }
            }

            outboxEventRepository.save(event);
        }
    }

    private String resolveTopic(String eventType) {
        if ("PAYMENT_PROCESS_REQUESTED".equals(eventType)) {
            return TOPIC_PAYMENT_REQUESTED;
        }
        return "wallet.events.default";
    }
}
