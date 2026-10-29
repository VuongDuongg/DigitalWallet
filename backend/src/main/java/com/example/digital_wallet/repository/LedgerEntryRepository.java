package com.example.digital_wallet.repository;

import com.example.digital_wallet.model.entity.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {

    // Tính toán số dư tài khoản dẫn xuất từ toàn bộ lịch sử sổ cái (Double-Entry Bookkeeping)
    @Query("""
        SELECT COALESCE(
            SUM(CASE WHEN e.entryType = com.example.digital_wallet.model.enums.EntryType.CREDIT THEN e.amount ELSE -e.amount END),
            0
        )
        FROM LedgerEntry e
        WHERE e.account.accountId = :accountId
    """)
    BigDecimal calculateCurrentBalance(@Param("accountId") UUID accountId);

    // Tính toán số dư gia tăng kể từ thời điểm chốt Snapshot (Checkpointing)
    @Query("""
        SELECT COALESCE(
            SUM(CASE WHEN e.entryType = com.example.digital_wallet.model.enums.EntryType.CREDIT THEN e.amount ELSE -e.amount END),
            0
        )
        FROM LedgerEntry e
        WHERE e.account.accountId = :accountId AND e.createdAt > :since
    """)
    BigDecimal calculateBalanceDeltaSince(@Param("accountId") UUID accountId, @Param("since") Instant since);

    // Lấy lịch sử biến động số dư theo tài khoản (phân trang)
    Page<LedgerEntry> findByAccount_AccountIdOrderByCreatedAtDesc(UUID accountId, Pageable pageable);
}
