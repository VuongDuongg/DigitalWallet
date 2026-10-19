package com.example.digital_wallet.repository;

import com.example.digital_wallet.model.entity.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.UUID;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {

    // Tính toán số dư tài khoản dẫn xuất từ lịch sử sổ cái (Double-Entry Bookkeeping)
    // Balance = Tổng CREDIT - Tổng DEBIT
    @Query("""
        SELECT COALESCE(
            SUM(CASE WHEN e.entryType = com.example.digital_wallet.model.enums.EntryType.CREDIT THEN e.amount ELSE -e.amount END),
            0
        )
        FROM LedgerEntry e
        WHERE e.account.accountId = :accountId
    """)
    BigDecimal calculateCurrentBalance(@Param("accountId") UUID accountId);

    // Lấy lịch sử biến động số dư theo tài khoản (phân trang)
    Page<LedgerEntry> findByAccount_AccountIdOrderByCreatedAtDesc(UUID accountId, Pageable pageable);
}
