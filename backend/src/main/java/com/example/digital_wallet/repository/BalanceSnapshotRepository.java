package com.example.digital_wallet.repository;

import com.example.digital_wallet.model.entity.BalanceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BalanceSnapshotRepository extends JpaRepository<BalanceSnapshot, UUID> {

    @Query(value = """
        SELECT * FROM balance_snapshots 
        WHERE account_id = :accountId 
        ORDER BY created_at DESC 
        LIMIT 1
    """, nativeQuery = true)
    Optional<BalanceSnapshot> findLatestSnapshotByAccountId(@Param("accountId") UUID accountId);
}

