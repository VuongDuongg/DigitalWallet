package com.example.digital_wallet.controller;

import com.example.digital_wallet.model.dto.LedgerEntryResponse;
import com.example.digital_wallet.model.dto.TransactionResponse;
import com.example.digital_wallet.model.entity.BalanceSnapshot;
import com.example.digital_wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/wallets")
@RequiredArgsConstructor
public class AdminWalletController {

    private final WalletService walletService;

    /**
     * 1. [ADMIN AUDIT] Kiểm toán toàn diện Sổ cái kép (Double-Entry Ledger)
     */
    @GetMapping("/ledger/{accountId}")
    public ResponseEntity<Page<LedgerEntryResponse>> getLedgerAuditLog(
            @PathVariable UUID accountId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("[ADMIN AUDIT] Kiểm toán sổ cái cho accountId={}", accountId);
        Page<LedgerEntryResponse> entries = walletService.getLedgerHistory(accountId, pageable);
        return ResponseEntity.ok(entries);
    }

    /**
     * 2. [ADMIN ENGINE] Kích hoạt chốt Balance Snapshot (Ledger Checkpoint O(1))
     */
    @PostMapping("/snapshots/{accountId}")
    public ResponseEntity<Map<String, Object>> triggerBalanceSnapshot(@PathVariable UUID accountId) {
        log.info("[ADMIN ENGINE] Yêu cầu chốt Snapshot số dư cho accountId={}", accountId);
        BalanceSnapshot snapshot = walletService.createBalanceSnapshot(accountId);
        return ResponseEntity.ok(Map.of(
                "snapshotId", snapshot.getSnapshotId(),
                "accountId", accountId,
                "snapshotBalance", snapshot.getBalance(),
                "createdAt", snapshot.getCreatedAt(),
                "message", "Chốt Snapshot số dư thành công (Tối ưu hóa O(1))"
        ));
    }

    /**
     * 3. [ADMIN SAGA INSPECTOR] Tra cứu trạng thái giao dịch & kiểm tra bù trừ Saga
     */
    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<TransactionResponse> inspectTransaction(@PathVariable UUID transactionId) {
        log.info("[ADMIN SAGA] Tra cứu chi tiết giao dịch txId={}", transactionId);
        TransactionResponse transaction = walletService.getTransaction(transactionId);
        return ResponseEntity.ok(transaction);
    }
}

