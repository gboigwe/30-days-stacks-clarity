;; AgeOfDevs Token - A cryptocurrency for the developer community
;; Full SIP-010 compliance with advanced community distribution mechanics

;; Implement the SIP-010 trait
(impl-trait .sip-010-trait.sip-010-trait)

;; Token configuration constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant TOKEN-NAME "AgeOfDevs Token")
(define-constant TOKEN-SYMBOL "AOD")
(define-constant TOKEN-DECIMALS u6)  ;; 1 AOD = 1,000,000 micro-AOD
(define-constant TOTAL-SUPPLY u10000000000000)  ;; 10,000,000 AOD total supply (with decimals)
(define-constant DISTRIBUTION-AMOUNT u1000000000)  ;; 1,000 AOD per claim (with decimals)
(define-constant MAX-DISTRIBUTION-CLAIMS u30)  ;; First 30 people can claim

;; Error codes
(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-INSUFFICIENT-BALANCE u101)
(define-constant ERR-INVALID-AMOUNT u102)
(define-constant ERR-DISTRIBUTION-ENDED u103)
(define-constant ERR-ALREADY-CLAIMED u104)
(define-constant ERR-DISTRIBUTION-FULL u105)
(define-constant ERR-INVALID-PRINCIPAL u106)

;; Core token storage - using Clarity 3.0 fungible tokens
(define-fungible-token ageofdevs-token TOTAL-SUPPLY)

;; Enhanced token holder tracking with Clarity 3.0 features
(define-map token-holders principal {
  balance: uint,
  first-received-block: uint,      ;; Block height when first received tokens
  last-activity-block: uint,       ;; Last transaction block
  total-earned: uint,              ;; Total tokens earned (not bought/transferred)
  total-transferred-in: uint,      ;; Tokens received from others
  total-transferred-out: uint,     ;; Tokens sent to others
  reputation-level: uint,          ;; Computed reputation score
  governance-power: uint           ;; Voting power calculation
})

;; Community distribution tracking for fair launch
(define-map distribution-claims principal {
  claimed: bool,
  claim-amount: uint,
  claim-block: uint,
  claim-number: uint
})

;; Global distribution state
(define-data-var total-distribution-claims uint u0)
(define-data-var distribution-active bool true)
(define-data-var contract-initialized bool false)

;; Initialize contract and mint initial supply to contract owner
(define-private (initialize-contract)
  (begin
    (asserts! (not (var-get contract-initialized)) (err ERR-UNAUTHORIZED))
    (try! (ft-mint? ageofdevs-token TOTAL-SUPPLY CONTRACT-OWNER))
    (var-set contract-initialized true)
    (ok true)
  )
)

;; SIP-010 Standard Functions

;; Transfer tokens from sender to recipient
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    ;; Validate inputs
    (asserts! (> amount u0) (err ERR-INVALID-AMOUNT))
    (asserts! (is-eq tx-sender from) (err ERR-UNAUTHORIZED))
    (asserts! (not (is-eq from to)) (err ERR-INVALID-PRINCIPAL))
    
    ;; Perform the transfer
    (try! (ft-transfer? ageofdevs-token amount from to))
    
    ;; Update holder statistics
    (update-holder-stats from to amount)
    
    ;; Print transfer event
    (print {
      type: "transfer",
      from: from,
      to: to,
      amount: amount,
      memo: memo,
      block-height: stacks-block-height
    })
    
    (ok true)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok TOKEN-NAME)
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok TOKEN-SYMBOL)
)

;; Get token decimals
(define-read-only (get-decimals)
  (ok TOKEN-DECIMALS)
)

;; Get balance of a principal
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance ageofdevs-token who))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply ageofdevs-token))
)

;; Get token URI (optional for SIP-010)
(define-read-only (get-token-uri)
  (ok (some u"https://ageofdevs.com/token-metadata.json"))
)

;; Community Distribution Functions

;; Main community distribution function - first 30 people get 1000 tokens each
(define-public (claim-community-distribution)
  (let (
    (current-claims (var-get total-distribution-claims))
    (existing-claim (map-get? distribution-claims tx-sender))
    (next-claim-number (+ current-claims u1))
  )
    (begin
      ;; Initialize contract if not already done
      (if (not (var-get contract-initialized))
        (try! (initialize-contract))
        true
      )
      
      ;; Check if distribution is still active
      (asserts! (var-get distribution-active) (err ERR-DISTRIBUTION-ENDED))
      
      ;; Check if user hasn't claimed yet
      (asserts! (is-none existing-claim) (err ERR-ALREADY-CLAIMED))
      
      ;; Check if we haven't exceeded max claims
      (asserts! (< current-claims MAX-DISTRIBUTION-CLAIMS) (err ERR-DISTRIBUTION-FULL))
      
      ;; Transfer tokens from contract owner to claimer
      (try! (ft-transfer? ageofdevs-token DISTRIBUTION-AMOUNT CONTRACT-OWNER tx-sender))
      
      ;; Record the claim
      (map-set distribution-claims tx-sender {
        claimed: true,
        claim-amount: DISTRIBUTION-AMOUNT,
        claim-block: stacks-block-height,
        claim-number: next-claim-number
      })
      
      ;; Initialize holder stats for new holder
      (map-set token-holders tx-sender {
        balance: DISTRIBUTION-AMOUNT,
        first-received-block: stacks-block-height,
        last-activity-block: stacks-block-height,
        total-earned: DISTRIBUTION-AMOUNT,
        total-transferred-in: u0,
        total-transferred-out: u0,
        reputation-level: u1,
        governance-power: DISTRIBUTION-AMOUNT
      })
      
      ;; Update total claims
      (var-set total-distribution-claims next-claim-number)
      
      ;; If this was the 30th claim, end distribution
      (if (>= next-claim-number MAX-DISTRIBUTION-CLAIMS)
        (var-set distribution-active false)
        true
      )
      
      ;; Print claim event
      (print {
        type: "distribution-claim",
        claimer: tx-sender,
        amount: DISTRIBUTION-AMOUNT,
        claim-number: next-claim-number,
        block-height: stacks-block-height,
        distribution-ended: (>= next-claim-number MAX-DISTRIBUTION-CLAIMS)
      })
      
      (ok {
        message: "Welcome to the AgeOfDevs community!",
        tokens-received: DISTRIBUTION-AMOUNT,
        claim-number: next-claim-number,
        block-height: stacks-block-height,
        distribution-active: (< next-claim-number MAX-DISTRIBUTION-CLAIMS)
      })
    )
  )
)

;; Helper function to update holder statistics
(define-private (update-holder-stats (from principal) (to principal) (amount uint))
  (let (
    (from-stats (default-to {
      balance: u0,
      first-received-block: stacks-block-height,
      last-activity-block: stacks-block-height,
      total-earned: u0,
      total-transferred-in: u0,
      total-transferred-out: u0,
      reputation-level: u0,
      governance-power: u0
    } (map-get? token-holders from)))
    
    (to-stats (default-to {
      balance: u0,
      first-received-block: stacks-block-height,
      last-activity-block: stacks-block-height,
      total-earned: u0,
      total-transferred-in: u0,
      total-transferred-out: u0,
      reputation-level: u0,
      governance-power: u0
    } (map-get? token-holders to)))
  )
    (begin
      ;; Update sender stats
      (map-set token-holders from (merge from-stats {
        balance: (ft-get-balance ageofdevs-token from),
        last-activity-block: stacks-block-height,
        total-transferred-out: (+ (get total-transferred-out from-stats) amount),
        governance-power: (ft-get-balance ageofdevs-token from)
      }))
      
      ;; Update receiver stats  
      (map-set token-holders to (merge to-stats {
        balance: (ft-get-balance ageofdevs-token to),
        last-activity-block: stacks-block-height,
        total-transferred-in: (+ (get total-transferred-in to-stats) amount),
        governance-power: (ft-get-balance ageofdevs-token to)
      }))
      
      true
    )
  )
)

;; Administrative Functions (for task integration)

;; Mint tokens as task rewards - only contract owner can call
(define-public (mint-task-reward (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    (asserts! (> amount u0) (err ERR-INVALID-AMOUNT))
    
    ;; Mint new tokens to recipient
    (try! (ft-mint? ageofdevs-token amount recipient))
    
    ;; Update recipient stats
    (let (
      (recipient-stats (default-to {
        balance: u0,
        first-received-block: stacks-block-height,
        last-activity-block: stacks-block-height,
        total-earned: u0,
        total-transferred-in: u0,
        total-transferred-out: u0,
        reputation-level: u0,
        governance-power: u0
      } (map-get? token-holders recipient)))
    )
      (map-set token-holders recipient (merge recipient-stats {
        balance: (ft-get-balance ageofdevs-token recipient),
        last-activity-block: stacks-block-height,
        total-earned: (+ (get total-earned recipient-stats) amount),
        reputation-level: (+ (get reputation-level recipient-stats) u1),
        governance-power: (ft-get-balance ageofdevs-token recipient)
      }))
    )
    
    ;; Print mint event
    (print {
      type: "task-reward-mint",
      recipient: recipient,
      amount: amount,
      block-height: stacks-block-height
    })
    
    (ok true)
  )
)

;; Read-only Functions for Enhanced Data

;; Get holder statistics
(define-read-only (get-holder-stats (holder principal))
  (ok (map-get? token-holders holder))
)

;; Get distribution claim information
(define-read-only (get-distribution-claim (claimer principal))
  (ok (map-get? distribution-claims claimer))
)

;; Get distribution information
(define-read-only (get-distribution-info)
  (ok {
    total-claims: (var-get total-distribution-claims),
    max-claims: MAX-DISTRIBUTION-CLAIMS,
    distribution-active: (var-get distribution-active),
    claims-remaining: (- MAX-DISTRIBUTION-CLAIMS (var-get total-distribution-claims)),
    distribution-amount: DISTRIBUTION-AMOUNT
  })
)

;; Get contract information
(define-read-only (get-contract-info)
  (ok {
    name: TOKEN-NAME,
    symbol: TOKEN-SYMBOL,
    decimals: TOKEN-DECIMALS,
    total-supply: (ft-get-supply ageofdevs-token),
    contract-owner: CONTRACT-OWNER,
    initialized: (var-get contract-initialized)
  })
)

;; Check if user has claimed distribution
(define-read-only (has-claimed-distribution (user principal))
  (ok (is-some (map-get? distribution-claims user)))
)