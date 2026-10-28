package com.example.digital_wallet.controller;

import com.example.digital_wallet.model.dto.CreateAccountRequest;
import com.example.digital_wallet.model.dto.DepositRequest;
import com.example.digital_wallet.model.dto.LedgerEntryResponse;
import com.example.digital_wallet.model.dto.TransactionResponse;
import com.example.digital_wallet.model.dto.TransferRequest;
import com.example.digital_wallet.model.entity.WalletAccount;
import com.example.digital_wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    /**
     * 1. Tạo tài khoản ví mới
     */
    @PostMapping("/accounts")
    public ResponseEntity<WalletAccount> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        WalletAccount account = walletService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    /**
     * 2. Nạp tiền vào ví
     */
    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(@Valid @RequestBody DepositRequest request) {
        TransactionResponse response = walletService.deposit(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 3. Chuyển tiền giữa các ví (Hỗ trợ header X-Idempotency-Key)
     */
    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKeyHeader,
            @Valid @RequestBody TransferRequest request) {

        // Ưu tiên Idempotency Key từ header nếu có
        if (idempotencyKeyHeader != null && !idempotencyKeyHeader.trim().isEmpty()) {
            request.setIdempotencyKey(idempotencyKeyHeader.trim());
        }

        TransactionResponse response = walletService.transfer(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    /**
     * 4. Xem số dư ví thời gian thực (tính từ Sổ cái kép)
     */
    @GetMapping("/{accountId}/balance")
    public ResponseEntity<Map<String, Object>> getBalance(@PathVariable UUID accountId) {
        BigDecimal balance = walletService.getBalance(accountId);
        return ResponseEntity.ok(Map.of(
                "accountId", accountId,
                "balance", balance,
                "currency", "VND"
        ));
    }

    /**
     * 5. Lấy lịch sử biến động số dư (Ledger History phân trang)
     */
    @GetMapping("/{accountId}/ledger")
    public ResponseEntity<Page<LedgerEntryResponse>> getLedgerHistory(
            @PathVariable UUID accountId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<LedgerEntryResponse> entries = walletService.getLedgerHistory(accountId, pageable);
        return ResponseEntity.ok(entries);
    }

    /**
     * 6. Tra cứu chi tiết & trạng thái giao dịch (PENDING -> COMPLETED hoặc FAILED)
     */
    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable UUID transactionId) {
        TransactionResponse transaction = walletService.getTransaction(transactionId);
        return ResponseEntity.ok(transaction);
    }
}
