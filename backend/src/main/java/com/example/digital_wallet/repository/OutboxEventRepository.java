package com.example.digital_wallet.repository;

import com.example.digital_wallet.model.entity.OutboxEvent;
import com.example.digital_wallet.model.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    // Chiếm quyền xử lý 50 sự kiện INIT đồng thời chuyển sang PROCESSING bằng SKIP LOCKED
    // Ngăn chặn 100% race condition giữa các instance pod backend
    @Modifying
    @Query(value = """
        UPDATE outbox_events 
        SET status = 'PROCESSING' 
        WHERE event_id IN (
            SELECT event_id FROM outbox_events 
            WHERE status = 'INIT' 
            ORDER BY created_at ASC 
            LIMIT 50 
            FOR UPDATE SKIP LOCKED
        )
    """, nativeQuery = true)
    int claimBatchForProcessing();

    List<OutboxEvent> findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus status);
}
