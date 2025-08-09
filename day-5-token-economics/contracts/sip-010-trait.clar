;; SIP-010 Standard Trait Definition
;; This trait defines the interface that all SIP-010 compliant tokens must implement

(define-trait sip-010-trait
  (
    ;; Transfer tokens from one principal to another
    ;; Returns (ok true) on success, error on failure
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    
    ;; Get the human readable name of the token
    (get-name () (response (string-ascii 32) uint))
    
    ;; Get the ticker symbol of the token  
    (get-symbol () (response (string-ascii 10) uint))
    
    ;; Get the number of decimals the token uses
    (get-decimals () (response uint uint))
    
    ;; Get the balance of the specified principal
    (get-balance (principal) (response uint uint))
    
    ;; Get the total supply of tokens
    (get-total-supply () (response uint uint))
    
    ;; Get the URI for token metadata (optional)
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)