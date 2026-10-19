package com.example.digital_wallet.repository;

import com.example.digital_wallet.model.entity.WalletAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface WalletAccountRepository extends JpaRepository<WalletAccount, UUID> {

    Optional<WalletAccount> findByUserId(String userId);

    boolean existsByUserId(String userId);

    // Hỗ trợ Pessimistic Lock (SELECT ... FOR UPDATE) làm phương án dự phòng khi không dùng Redisson Lock
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM WalletAccount a WHERE a.accountId = :accountId")
    Optional<WalletAccount> findByIdWithLock(@Param("accountId") UUID accountId);
}
