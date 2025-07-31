;; Hello World - Clarity 3.0 Smart Contract
;; This contract demonstrates modern Clarity 3.0 patterns and syntax

;; Storage variables
(define-data-var greeting (string-ascii 50) "Hello, Clarity 3.0!")
(define-data-var owner principal tx-sender)
(define-data-var update-count uint u0)

;; Error constants - best practice for clear error handling
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TOO-LONG (err u101))
(define-constant ERR-EMPTY-STRING (err u102))

;; Read-only function to get the current greeting
;; This function is free to call and doesn't modify state
(define-read-only (get-greeting)
  (var-get greeting)
)

;; Read-only function to get the contract owner
(define-read-only (get-owner)
  (var-get owner)
)

;; Read-only function to get update statistics
(define-read-only (get-stats)
  {
    greeting: (var-get greeting),
    owner: (var-get owner),
    update-count: (var-get update-count),
    total-updates: (var-get update-count)
  }
)

;; Read-only function demonstrating Clarity 3.0 block height features
;; This shows the difference between stacks-block-height and tenure-height
(define-read-only (get-block-info)
  {
    stacks-blocks: stacks-block-height,     ;; Fast Stacks blocks (Clarity 3.0)
    tenure-blocks: tenure-height,           ;; Slow tenure blocks (~10 min intervals)
    estimated-time: (* tenure-height u600) ;; Approximate timestamp in seconds
  }
)

;; Public function to set a new greeting
;; This function costs gas and can modify the contract state
(define-public (set-greeting (new-greeting (string-ascii 50)))
  (begin
    ;; Validate that caller is the owner
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-AUTHORIZED)
    
    ;; Validate that greeting is not empty
    (asserts! (> (len new-greeting) u0) ERR-EMPTY-STRING)
    
    ;; Validate greeting length
    (asserts! (<= (len new-greeting) u50) ERR-TOO-LONG)
    
    ;; Update the greeting
    (var-set greeting new-greeting)
    
    ;; Increment the update counter
    (var-set update-count (+ (var-get update-count) u1))
    
    ;; Return success with useful information
    (ok {
      message: "Greeting updated successfully!",
      new-greeting: new-greeting,
      update-number: (var-get update-count),
      block-height: stacks-block-height,    ;; Clarity 3.0 syntax
      tenure-height: tenure-height          ;; Clarity 3.0 syntax
    })
  )
)

;; Public function to transfer ownership
;; Demonstrates access control patterns
(define-public (transfer-ownership (new-owner principal))
  (begin
    ;; Only current owner can transfer ownership
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-AUTHORIZED)
    
    ;; Update the owner
    (var-set owner new-owner)
    
    ;; Return success
    (ok {
      message: "Ownership transferred successfully!",
      old-owner: tx-sender,
      new-owner: new-owner,
      block-height: stacks-block-height
    })
  )
)

;; Public function that anyone can call to increment a counter
;; Demonstrates public vs owner-only functions
(define-public (increment-public-counter)
  (begin
    ;; This function can be called by anyone
    (var-set update-count (+ (var-get update-count) u1))
    
    (ok {
      message: "Counter incremented by public user",
      caller: tx-sender,
      new-count: (var-get update-count),
      block-height: stacks-block-height
    })
  )
)

;; Read-only helper function to check if an address is the owner
(define-read-only (is-owner (address principal))
  (is-eq address (var-get owner))
)

;; Read-only function to get contract info for debugging
(define-read-only (get-contract-info)
  {
    name: "Hello World Clarity 3.0",
    version: "1.0.0",
    description: "A simple greeting contract demonstrating Clarity 3.0 features",
    owner: (var-get owner),
    current-block: stacks-block-height,
    current-tenure: tenure-height
  }
)
