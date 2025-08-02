;; Advanced Hello World - Clarity 3.0 Smart Contract with Write Capabilities
;; Day 3: Making Your dApp Interactive - Understanding Blockchain Writing
;; 
;; This contract demonstrates:
;; - Enhanced greeting system with metadata
;; - User profiles and interaction tracking
;; - Payment mechanisms for premium features
;; - Advanced data structures using maps and tuples
;; - Transaction-based interactions that change blockchain state

;; =============================================================================
;; STORAGE VARIABLES
;; =============================================================================

;; Global greeting (anyone can pay to update this)
(define-data-var global-greeting (string-ascii 100) "Hello, Blockchain World!")
(define-data-var global-greeting-author principal tx-sender)
(define-data-var global-greeting-updated-at uint u0)
(define-data-var global-update-count uint u0)

;; Contract configuration
(define-data-var owner principal tx-sender)
(define-data-var update-cost uint u1000000) ;; 1 STX in microSTX

;; =============================================================================
;; DATA MAPS - Advanced Data Structures
;; =============================================================================

;; User profiles with personal greetings and statistics
(define-map user-profiles
  { user: principal }
  {
    personal-greeting: (string-ascii 100),
    total-updates: uint,
    global-updates: uint,
    last-update: uint,
    stx-spent: uint
  }
)

;; Greeting history for global updates (paid updates)
(define-map greeting-history
  { entry-id: uint }
  {
    message: (string-ascii 100),
    author: principal,
    block-height: uint,
    tenure-height: uint,
    stx-paid: uint,
    likes: uint
  }
)

;; Like system - tracks who liked which greeting
(define-map greeting-likes
  { entry-id: uint, user: principal }
  { liked: bool }
)

;; =============================================================================
;; ERROR CONSTANTS
;; =============================================================================

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TOO-LONG (err u101))
(define-constant ERR-EMPTY-STRING (err u102))
(define-constant ERR-INSUFFICIENT-PAYMENT (err u103))
(define-constant ERR-ENTRY-NOT-FOUND (err u104))
(define-constant ERR-ALREADY-LIKED (err u105))
(define-constant ERR-CANNOT-LIKE-OWN (err u106))

;; =============================================================================
;; READ-ONLY FUNCTIONS (Free to call, don't change state)
;; =============================================================================

;; Get the current global greeting with full metadata
(define-read-only (get-greeting-with-metadata)
  {
    message: (var-get global-greeting),
    author: (var-get global-greeting-author),
    updated-at: (var-get global-greeting-updated-at),
    update-count: (var-get global-update-count),
    current-cost: (var-get update-cost)
  }
)

;; Get user's personal greeting and statistics
(define-read-only (get-user-greeting-data (user principal))
  (match (map-get? user-profiles { user: user })
    profile (some profile)
    none
  )
)

;; Get a specific greeting from history
(define-read-only (get-greeting-history-entry (entry-id uint))
  (map-get? greeting-history { entry-id: entry-id })
)

;; Get contract statistics and Clarity 3.0 block info
(define-read-only (get-contract-stats)
  {
    total-global-updates: (var-get global-update-count),
    current-update-cost: (var-get update-cost),
    contract-owner: (var-get owner),
    stacks-blocks: stacks-block-height,     ;; Clarity 3.0 feature
    tenure-blocks: tenure-height,           ;; Clarity 3.0 feature
    estimated-time: (* tenure-height u600)  ;; Approximate seconds
  }
)

;; Check if user has liked a specific greeting
(define-read-only (has-user-liked (entry-id uint) (user principal))
  (default-to false (get liked (map-get? greeting-likes { entry-id: entry-id, user: user })))
)

;; Get the basic greeting (backward compatibility with Day 2)
(define-read-only (get-greeting)
  (var-get global-greeting)
)

;; =============================================================================
;; WRITE FUNCTIONS (Cost STX, change blockchain state)
;; =============================================================================

;; Update global greeting (costs STX - this is the main paid feature)
(define-public (set-greeting-with-payment (new-greeting (string-ascii 100)))
  (let (
    (cost (var-get update-cost))
    (new-id (+ (var-get global-update-count) u1))
  )
    (begin
      ;; Validate input
      (asserts! (> (len new-greeting) u0) ERR-EMPTY-STRING)
      (asserts! (<= (len new-greeting) u100) ERR-TOO-LONG)
      
      ;; Transfer STX payment to contract owner
      (try! (stx-transfer? cost tx-sender (var-get owner)))
      
      ;; Store the old greeting in history
      (map-set greeting-history 
        { entry-id: new-id }
        {
          message: new-greeting,
          author: tx-sender,
          block-height: stacks-block-height,
          tenure-height: tenure-height,
          stx-paid: cost,
          likes: u0
        }
      )
      
      ;; Update global state
      (var-set global-greeting new-greeting)
      (var-set global-greeting-author tx-sender)
      (var-set global-greeting-updated-at stacks-block-height)
      (var-set global-update-count new-id)
      
      ;; Update user profile
      (map-set user-profiles
        { user: tx-sender }
        (merge 
          (default-to 
            {
              personal-greeting: "",
              total-updates: u0,
              global-updates: u0,
              last-update: u0,
              stx-spent: u0
            }
            (map-get? user-profiles { user: tx-sender })
          )
          {
            global-updates: (+ (default-to u0 (get global-updates (map-get? user-profiles { user: tx-sender }))) u1),
            total-updates: (+ (default-to u0 (get total-updates (map-get? user-profiles { user: tx-sender }))) u1),
            last-update: stacks-block-height,
            stx-spent: (+ (default-to u0 (get stx-spent (map-get? user-profiles { user: tx-sender }))) cost)
          }
        )
      )
      
      ;; Return success with useful information
      (ok {
        message: "Global greeting updated successfully!",
        new-greeting: new-greeting,
        entry-id: new-id,
        cost-paid: cost,
        block-height: stacks-block-height,
        author: tx-sender
      })
    )
  )
)

;; Set personal greeting (free, only affects user's profile)
(define-public (set-personal-greeting-advanced (message (string-ascii 100)))
  (begin
    ;; Validate input
    (asserts! (> (len message) u0) ERR-EMPTY-STRING)
    (asserts! (<= (len message) u100) ERR-TOO-LONG)
    
    ;; Update user profile
    (map-set user-profiles
      { user: tx-sender }
      (merge 
        (default-to 
          {
            personal-greeting: "",
            total-updates: u0,
            global-updates: u0,
            last-update: u0,
            stx-spent: u0
          }
          (map-get? user-profiles { user: tx-sender })
        )
        {
          personal-greeting: message,
          total-updates: (+ (default-to u0 (get total-updates (map-get? user-profiles { user: tx-sender }))) u1),
          last-update: stacks-block-height
        }
      )
    )
    
    (ok {
      message: "Personal greeting updated successfully!",
      personal-greeting: message,
      block-height: stacks-block-height
    })
  )
)

;; Like a greeting entry (costs small amount of gas, creates social interaction)
(define-public (like-greeting (entry-id uint))
  (let (
    (greeting-entry (unwrap! (map-get? greeting-history { entry-id: entry-id }) ERR-ENTRY-NOT-FOUND))
    (author (get author greeting-entry))
  )
    (begin
      ;; Can't like your own greeting
      (asserts! (not (is-eq tx-sender author)) ERR-CANNOT-LIKE-OWN)
      
      ;; Can't like the same greeting twice
      (asserts! (not (has-user-liked entry-id tx-sender)) ERR-ALREADY-LIKED)
      
      ;; Record the like
      (map-set greeting-likes
        { entry-id: entry-id, user: tx-sender }
        { liked: true }
      )
      
      ;; Increment like count
      (map-set greeting-history
        { entry-id: entry-id }
        (merge greeting-entry { likes: (+ (get likes greeting-entry) u1) })
      )
      
      (ok {
        message: "Greeting liked successfully!",
        entry-id: entry-id,
        new-like-count: (+ (get likes greeting-entry) u1)
      })
    )
  )
)

;; =============================================================================
;; ADMIN FUNCTIONS (Only contract owner)
;; =============================================================================

;; Update the cost to change global greeting (owner only)
(define-public (set-update-cost (new-cost uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-AUTHORIZED)
    (var-set update-cost new-cost)
    (ok { message: "Update cost changed", new-cost: new-cost })
  )
)

;; Transfer ownership (current owner only)
(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-AUTHORIZED)
    (var-set owner new-owner)
    (ok { message: "Ownership transferred", new-owner: new-owner })
  )
)

;; =============================================================================
;; UTILITY FUNCTIONS
;; =============================================================================

;; Check if address is the contract owner
(define-read-only (is-owner (address principal))
  (is-eq address (var-get owner))
)

;; Get contract information for debugging and UI
(define-read-only (get-contract-info)
  {
    name: "Advanced Hello World",
    version: "3.0.0",
    description: "Interactive greeting contract with payments, likes, and user profiles",
    owner: (var-get owner),
    features: "global-greeting, personal-greetings, payment-system, like-system",
    clarity-version: "3.0",
    current-block: stacks-block-height,
    current-tenure: tenure-height
  }
)

