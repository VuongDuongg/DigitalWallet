package com.example.digital_wallet.repository;

import com.example.digital_wallet.model.entity.OutboxEvent;
import com.example.digital_wallet.model.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    // Lấy top 50 sự kiện đang ở trạng thái INIT (chưa bắn lên Kafka) sắp xếp theo thời gian tạo
    List<OutboxEvent> findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus status);
}
