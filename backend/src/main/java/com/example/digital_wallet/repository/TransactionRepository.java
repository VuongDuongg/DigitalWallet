package com.example.digital_wallet.repository;

import com.example.digital_wallet.model.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Tìm kiếm giao dịch dựa vào Idempotency Key (Chống trùng lặp tầng DB)
    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKey(String idempotencyKey);
}
