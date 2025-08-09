;; Task Manager - Multi-User Task Management System
;; Day 4: Advanced Integration - Multi-User Contract Patterns
;; 
;; This contract demonstrates:
;; - Multi-user task creation and assignment
;; - Advanced permission systems (creator vs assignee rights)
;; - Task categories and filtering capabilities
;; - Reputation tracking based on task completion
;; - Reward escrow system for task payments
;; - Community statistics and leaderboards

;; =============================================================================
;; CONSTANTS AND ERROR CODES
;; =============================================================================

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TASK-NOT-FOUND (err u101))
(define-constant ERR-INVALID-STATUS (err u102))
(define-constant ERR-INSUFFICIENT-REWARD (err u103))
(define-constant ERR-TASK-ALREADY-ASSIGNED (err u104))
(define-constant ERR-TASK-NOT-ASSIGNED (err u105))
(define-constant ERR-INVALID-DIFFICULTY (err u106))
(define-constant ERR-INVALID-INPUT (err u107))
(define-constant ERR-APPLICATION-EXISTS (err u108))
(define-constant ERR-APPLICATION-NOT-FOUND (err u109))
(define-constant ERR-PROFILE-EXISTS (err u110))
(define-constant ERR-PROFILE-NOT-FOUND (err u111))

;; Task status constants
(define-constant STATUS-OPEN "open")
(define-constant STATUS-ASSIGNED "assigned")
(define-constant STATUS-COMPLETED "completed")
(define-constant STATUS-DISPUTED "disputed")
(define-constant STATUS-CANCELLED "cancelled")

;; Application status constants
(define-constant APP-STATUS-PENDING "pending")
(define-constant APP-STATUS-ACCEPTED "accepted")
(define-constant APP-STATUS-REJECTED "rejected")

;; Minimum reward amount (0.1 STX)
(define-constant MIN-REWARD u100000)

;; =============================================================================
;; DATA VARIABLES
;; =============================================================================

(define-data-var next-task-id uint u1)
(define-data-var next-application-id uint u1)
(define-data-var contract-owner principal tx-sender)
(define-data-var platform-fee-percentage uint u5) ;; 5% platform fee

;; =============================================================================
;; DATA MAPS
;; =============================================================================

;; Task storage with comprehensive metadata
(define-map tasks uint {
  title: (string-ascii 100),
  description: (string-ascii 500),
  creator: principal,
  assignee: (optional principal),
  category: (string-ascii 20),
  difficulty: uint,                    ;; 1-5 scale
  stx-reward: uint,
  token-reward: uint,                  ;; For Day 5 integration
  status: (string-ascii 20),           ;; "open", "assigned", "completed", "disputed"
  created-at: uint,
  assigned-at: (optional uint),
  completed-at: (optional uint),
  requires-approval: bool
})

;; User profiles with reputation system
(define-map user-profiles principal {
  username: (string-ascii 30),
  bio: (string-ascii 200),
  reputation-score: uint,
  tasks-created: uint,
  tasks-completed: uint,
  total-earned: uint,
  skills: (list 10 (string-ascii 20)),
  joined-at: uint,
  last-active: uint
})

;; Task assignments and applications
(define-map task-applications uint {
  task-id: uint,
  applicant: principal,
  application-message: (string-ascii 300),
  applied-at: uint,
  status: (string-ascii 20)           ;; "pending", "accepted", "rejected"
})

;; Escrow for task rewards
(define-map task-escrow uint {
  stx-amount: uint,
  locked: bool
})

;; Task categories for filtering
(define-map task-categories (string-ascii 20) {
  task-count: uint,
  total-rewards: uint
})

;; =============================================================================
;; READ-ONLY FUNCTIONS
;; =============================================================================

;; Get task details
(define-read-only (get-task (task-id uint))
  (map-get? tasks task-id)
)

;; Get user profile
(define-read-only (get-user-profile (user principal))
  (map-get? user-profiles user)
)

;; Get tasks by category
(define-read-only (get-tasks-by-category (category (string-ascii 20)))
  (let ((category-info (map-get? task-categories category)))
    (if (is-some category-info)
      (ok category-info)
      (err "Category not found")
    )
  )
)

;; Get tasks by user (simplified count-based approach)
(define-read-only (get-tasks-by-user (user principal))
  (match (map-get? user-profiles user)
    profile (ok {
      tasks-created: (get tasks-created profile),
      tasks-completed: (get tasks-completed profile)
    })
    (err "User profile not found")
  )
)

;; Get user reputation
(define-read-only (get-user-reputation (user principal))
  (match (map-get? user-profiles user)
    profile (get reputation-score profile)
    u0
  )
)

;; Get community stats
(define-read-only (get-community-stats)
  {
    total-tasks: (- (var-get next-task-id) u1),
    total-applications: (- (var-get next-application-id) u1),
    platform-fee: (var-get platform-fee-percentage),
    contract-owner: (var-get contract-owner)
  }
)

;; Get leaderboard (simplified version returning top stats)
(define-read-only (get-leaderboard (limit uint))
  ;; Simplified: returns community stats instead of individual rankings
  (get-community-stats)
)

;; Get application details
(define-read-only (get-application (application-id uint))
  (map-get? task-applications application-id)
)

;; Get task escrow info
(define-read-only (get-task-escrow-info (task-id uint))
  (map-get? task-escrow task-id)
)

;; =============================================================================
;; PUBLIC FUNCTIONS - USER PROFILE MANAGEMENT
;; =============================================================================

;; Create user profile
(define-public (create-profile (username (string-ascii 30)) (bio (string-ascii 200)) (skills (list 10 (string-ascii 20))))
  (let ((existing-profile (map-get? user-profiles tx-sender)))
    (begin
      (asserts! (is-none existing-profile) (err ERR-PROFILE-EXISTS))
      (asserts! (> (len username) u0) (err ERR-INVALID-INPUT))
      
      (map-set user-profiles tx-sender {
        username: username,
        bio: bio,
        reputation-score: u0,
        tasks-created: u0,
        tasks-completed: u0,
        total-earned: u0,
        skills: skills,
        joined-at: stacks-block-height,
        last-active: stacks-block-height
      })
      
      (ok { message: "Profile created successfully", user: tx-sender })
    )
  )
)

;; Update user profile
(define-public (update-profile (bio (string-ascii 200)) (skills (list 10 (string-ascii 20))))
  (match (map-get? user-profiles tx-sender)
    profile
    (begin
      (map-set user-profiles tx-sender
        (merge profile {
          bio: bio,
          skills: skills,
          last-active: stacks-block-height
        })
      )
      (ok { message: "Profile updated successfully" })
    )
    (err ERR-PROFILE-NOT-FOUND)
  )
)

;; =============================================================================
;; PUBLIC FUNCTIONS - TASK MANAGEMENT
;; =============================================================================

;; Create a new task
(define-public (create-task 
    (title (string-ascii 100)) 
    (description (string-ascii 500)) 
    (category (string-ascii 20)) 
    (difficulty uint) 
    (stx-reward uint)
  )
  (let ((task-id (var-get next-task-id)))
    (begin
      ;; Validate inputs
      (asserts! (> (len title) u0) (err ERR-INVALID-INPUT))
      (asserts! (> (len description) u0) (err ERR-INVALID-INPUT))
      (asserts! (and (>= difficulty u1) (<= difficulty u5)) (err ERR-INVALID-DIFFICULTY))
      (asserts! (>= stx-reward MIN-REWARD) (err ERR-INSUFFICIENT-REWARD))
      
      ;; Transfer STX to escrow
      (unwrap-panic (stx-transfer? stx-reward tx-sender (as-contract tx-sender)))
      
      ;; Create task
      (map-set tasks task-id {
        title: title,
        description: description,
        creator: tx-sender,
        assignee: none,
        category: category,
        difficulty: difficulty,
        stx-reward: stx-reward,
        token-reward: u0,
        status: STATUS-OPEN,
        created-at: stacks-block-height,
        assigned-at: none,
        completed-at: none,
        requires-approval: true
      })
      
      ;; Store escrow info
      (map-set task-escrow task-id {
        stx-amount: stx-reward,
        locked: true
      })
      
      ;; Update category stats
      (update-category-stats category stx-reward)
      
      ;; Update user profile stats
      (update-user-profile-on-task-creation)
      
      ;; Increment task counter
      (var-set next-task-id (+ task-id u1))
      
      (ok {
        task-id: task-id,
        message: "Task created successfully",
        creator: tx-sender,
        escrow-locked: stx-reward
      })
    )
  )
)

;; Apply for a task
(define-public (apply-for-task (task-id uint) (application-message (string-ascii 300)))
  (let (
    (task (unwrap! (map-get? tasks task-id) (err ERR-TASK-NOT-FOUND)))
    (application-id (var-get next-application-id))
  )
    (begin
      ;; Validate task status and permissions
      (asserts! (is-eq (get status task) STATUS-OPEN) (err ERR-INVALID-STATUS))
      (asserts! (not (is-eq tx-sender (get creator task))) (err ERR-NOT-AUTHORIZED))
      
      ;; Create application
      (map-set task-applications application-id {
        task-id: task-id,
        applicant: tx-sender,
        application-message: application-message,
        applied-at: stacks-block-height,
        status: APP-STATUS-PENDING
      })
      
      ;; Increment application counter
      (var-set next-application-id (+ application-id u1))
      
      (ok {
        application-id: application-id,
        message: "Application submitted successfully",
        applicant: tx-sender
      })
    )
  )
)

;; Assign task to a user (task creator only)
(define-public (assign-task (task-id uint) (assignee principal))
  (let ((task (unwrap! (map-get? tasks task-id) (err ERR-TASK-NOT-FOUND))))
    (begin
      ;; Validate permissions and status
      (asserts! (is-eq tx-sender (get creator task)) (err ERR-NOT-AUTHORIZED))
      (asserts! (is-eq (get status task) STATUS-OPEN) (err ERR-INVALID-STATUS))
      
      ;; Assign task
      (map-set tasks task-id
        (merge task {
          assignee: (some assignee),
          status: STATUS-ASSIGNED,
          assigned-at: (some stacks-block-height)
        })
      )
      
      ;; Update assignee's last active
      (update-user-activity assignee)
      
      (ok {
        task-id: task-id,
        assignee: assignee,
        message: "Task assigned successfully"
      })
    )
  )
)

;; Complete a task (assignee only)
(define-public (complete-task (task-id uint))
  (let ((task (unwrap! (map-get? tasks task-id) (err ERR-TASK-NOT-FOUND))))
    (begin
      ;; Validate permissions and status
      (asserts! (is-eq (some tx-sender) (get assignee task)) (err ERR-NOT-AUTHORIZED))
      (asserts! (is-eq (get status task) STATUS-ASSIGNED) (err ERR-INVALID-STATUS))
      
      ;; Mark task as completed
      (map-set tasks task-id
        (merge task {
          status: STATUS-COMPLETED,
          completed-at: (some stacks-block-height)
        })
      )
      
      ;; If no approval required, automatically release payment
      (if (not (get requires-approval task))
        (begin
          (try! (release-task-payment task-id))
          (ok {
            task-id: task-id,
            message: "Task completed and payment released",
            auto-paid: true
          })
        )
        (ok {
          task-id: task-id,
          message: "Task completed, awaiting approval",
          auto-paid: false
        })
      )
    )
  )
)

;; Approve task completion and release payment (creator only)
(define-public (approve-completion (task-id uint))
  (let ((task (unwrap! (map-get? tasks task-id) (err ERR-TASK-NOT-FOUND))))
    (begin
      ;; Validate permissions and status
      (asserts! (is-eq tx-sender (get creator task)) (err ERR-NOT-AUTHORIZED))
      (asserts! (is-eq (get status task) STATUS-COMPLETED) (err ERR-INVALID-STATUS))
      (asserts! (get requires-approval task) (err ERR-INVALID-STATUS))
      
      ;; Release payment
      (try! (release-task-payment task-id))
      
      (ok {
        task-id: task-id,
        message: "Task completion approved and payment released"
      })
    )
  )
)

;; =============================================================================
;; PRIVATE HELPER FUNCTIONS
;; =============================================================================

;; Release payment to task assignee
(define-private (release-task-payment (task-id uint))
  (let (
    (task (unwrap! (map-get? tasks task-id) (err ERR-TASK-NOT-FOUND)))
    (assignee (unwrap! (get assignee task) (err ERR-TASK-NOT-ASSIGNED)))
    (reward-amount (get stx-reward task))
    (platform-fee (/ (* reward-amount (var-get platform-fee-percentage)) u100))
    (assignee-payment (- reward-amount platform-fee))
  )
    (begin
      ;; Transfer payment to assignee
      (unwrap-panic (as-contract (stx-transfer? assignee-payment tx-sender assignee)))
      
      ;; Transfer platform fee to owner
      (unwrap-panic (as-contract (stx-transfer? platform-fee tx-sender (var-get contract-owner))))
      
      ;; Update escrow status
      (map-set task-escrow task-id {
        stx-amount: u0,
        locked: false
      })
      
      ;; Update user profiles
      (update-user-profile-on-completion assignee assignee-payment)
      
      (ok assignee-payment)
    )
  )
)

;; Update category statistics
(define-private (update-category-stats (category (string-ascii 20)) (reward uint))
  (let ((current-stats (default-to { task-count: u0, total-rewards: u0 } 
                                  (map-get? task-categories category))))
    (map-set task-categories category {
      task-count: (+ (get task-count current-stats) u1),
      total-rewards: (+ (get total-rewards current-stats) reward)
    })
  )
)

;; Update user profile on task creation
(define-private (update-user-profile-on-task-creation)
  (match (map-get? user-profiles tx-sender)
    profile
    (map-set user-profiles tx-sender
      (merge profile {
        tasks-created: (+ (get tasks-created profile) u1),
        last-active: stacks-block-height
      })
    )
    false ;; Profile doesn't exist, ignore
  )
)

;; Update user profile on task completion
(define-private (update-user-profile-on-completion (user principal) (earned uint))
  (match (map-get? user-profiles user)
    profile
    (map-set user-profiles user
      (merge profile {
        tasks-completed: (+ (get tasks-completed profile) u1),
        total-earned: (+ (get total-earned profile) earned),
        reputation-score: (+ (get reputation-score profile) u10),
        last-active: stacks-block-height
      })
    )
    false ;; Profile doesn't exist, ignore
  )
)

;; Update user activity timestamp
(define-private (update-user-activity (user principal))
  (match (map-get? user-profiles user)
    profile
    (map-set user-profiles user
      (merge profile { last-active: stacks-block-height })
    )
    false ;; Profile doesn't exist, ignore
  )
)