package com.example.digital_wallet.repository;

import com.example.digital_wallet.model.entity.Transaction;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Tìm kiếm giao dịch dựa vào Idempotency Key (Chống trùng lặp tầng DB)
    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKey(String idempotencyKey);

    // Tìm giao dịch với Pessimistic Lock (SELECT ... FOR UPDATE)
    // Đảm bảo khi 1 luồng đang xử lý thì luồng khác phải chờ hoặc không được sửa
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Transaction t WHERE t.transactionId = :txId")
    Optional<Transaction> findByIdForUpdate(@Param("txId") UUID txId);
}
