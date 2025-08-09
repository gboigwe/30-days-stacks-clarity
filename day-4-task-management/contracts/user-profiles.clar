;; User Profiles - Advanced User Management System
;; Day 4: Multi-User Contract Patterns - Complementary Contract
;; 
;; This contract demonstrates:
;; - Extended user profile management
;; - Social features and connections
;; - Advanced reputation algorithms
;; - User badges and achievements
;; - Cross-contract data sharing

;; =============================================================================
;; CONSTANTS
;; =============================================================================

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-PROFILE-NOT-FOUND (err u201))
(define-constant ERR-INVALID-INPUT (err u202))
(define-constant ERR-CONNECTION-EXISTS (err u203))
(define-constant ERR-SELF-CONNECTION (err u204))
(define-constant ERR-BADGE-NOT-FOUND (err u205))
(define-constant ERR-ALREADY-CLAIMED (err u206))

;; Achievement thresholds
(define-constant BRONZE-THRESHOLD u5)
(define-constant SILVER-THRESHOLD u20)
(define-constant GOLD-THRESHOLD u50)

;; =============================================================================
;; DATA VARIABLES
;; =============================================================================

(define-data-var contract-owner principal tx-sender)
(define-data-var next-badge-id uint u1)
(define-data-var total-users uint u0)

;; =============================================================================
;; DATA MAPS
;; =============================================================================

;; Extended user profiles with social features
(define-map extended-profiles principal {
  display-name: (string-ascii 50),
  avatar-url: (string-ascii 200),
  location: (string-ascii 100),
  website: (string-ascii 200),
  social-links: (list 5 (string-ascii 200)),
  is-verified: bool,
  privacy-level: uint,  ;; 1=public, 2=friends, 3=private
  created-at: uint,
  updated-at: uint
})

;; User connections (following/followers system)
(define-map user-connections { follower: principal, following: principal } {
  connected-at: uint,
  connection-type: (string-ascii 10)
})

;; User achievements and badges
(define-map user-badges uint {
  name: (string-ascii 50),
  description: (string-ascii 200),
  icon: (string-ascii 100),
  rarity: (string-ascii 20),  ;; common, rare, epic, legendary
  created-at: uint
})

;; User badge ownership
(define-map user-badge-ownership { user: principal, badge-id: uint } {
  earned-at: uint,
  earned-for: (string-ascii 100)
})

;; User activity feed
(define-map user-activities { user: principal, activity-id: uint } {
  activity-type: (string-ascii 30),
  description: (string-ascii 200),
  metadata: (string-ascii 300),
  timestamp: uint,
  is-public: bool
})

;; User statistics aggregation
(define-map user-stats principal {
  followers-count: uint,
  following-count: uint,
  total-activities: uint,
  badge-count: uint,
  reputation-rank: uint,
  activity-score: uint
})

;; =============================================================================
;; READ-ONLY FUNCTIONS
;; =============================================================================

;; Get extended user profile
(define-read-only (get-extended-profile (user principal))
  (map-get? extended-profiles user)
)

;; Get user statistics
(define-read-only (get-user-stats (user principal))
  (default-to 
    {
      followers-count: u0,
      following-count: u0,
      total-activities: u0,
      badge-count: u0,
      reputation-rank: u0,
      activity-score: u0
    }
    (map-get? user-stats user)
  )
)

;; Check if users are connected
(define-read-only (are-users-connected (follower principal) (following principal))
  (is-some (map-get? user-connections { follower: follower, following: following }))
)

;; Get user's badges count
(define-read-only (get-user-badge-count (user principal))
  (get badge-count (get-user-stats user))
)

;; Get badge details
(define-read-only (get-badge-details (badge-id uint))
  (map-get? user-badges badge-id)
)

;; Check if user owns a specific badge
(define-read-only (user-owns-badge (user principal) (badge-id uint))
  (is-some (map-get? user-badge-ownership { user: user, badge-id: badge-id }))
)

;; Get user's achievement level based on reputation
(define-read-only (get-achievement-level (reputation uint))
  (if (>= reputation GOLD-THRESHOLD)
    "Gold"
    (if (>= reputation SILVER-THRESHOLD)
      "Silver"
      (if (>= reputation BRONZE-THRESHOLD)
        "Bronze"
        "Beginner"
      )
    )
  )
)

;; Get community statistics
(define-read-only (get-community-stats)
  {
    total-users: (var-get total-users),
    total-badges: (- (var-get next-badge-id) u1),
    contract-owner: (var-get contract-owner)
  }
)

;; =============================================================================
;; PUBLIC FUNCTIONS - PROFILE MANAGEMENT
;; =============================================================================

;; Create extended profile
(define-public (create-extended-profile
    (display-name (string-ascii 50))
    (avatar-url (string-ascii 200))
    (location (string-ascii 100))
    (website (string-ascii 200))
    (social-links (list 5 (string-ascii 200)))
    (privacy-level uint)
  )
  (let ((current-profile (map-get? extended-profiles tx-sender)))
    (begin
      (asserts! (is-none current-profile) (err ERR-INVALID-INPUT))
      (asserts! (> (len display-name) u0) (err ERR-INVALID-INPUT))
      (asserts! (and (>= privacy-level u1) (<= privacy-level u3)) (err ERR-INVALID-INPUT))
      
      ;; Create extended profile
      (map-set extended-profiles tx-sender {
        display-name: display-name,
        avatar-url: avatar-url,
        location: location,
        website: website,
        social-links: social-links,
        is-verified: false,
        privacy-level: privacy-level,
        created-at: stacks-block-height,
        updated-at: stacks-block-height
      })
      
      ;; Initialize user stats
      (map-set user-stats tx-sender {
        followers-count: u0,
        following-count: u0,
        total-activities: u0,
        badge-count: u0,
        reputation-rank: u0,
        activity-score: u0
      })
      
      ;; Increment total users
      (var-set total-users (+ (var-get total-users) u1))
      
      ;; Award welcome badge
      (unwrap-panic (award-system-badge tx-sender "welcome" "Welcome to the community!"))
      
      (ok { message: "Extended profile created successfully", user: tx-sender })
    )
  )
)

;; Update extended profile
(define-public (update-extended-profile
    (avatar-url (string-ascii 200))
    (location (string-ascii 100))
    (website (string-ascii 200))
    (social-links (list 5 (string-ascii 200)))
    (privacy-level uint)
  )
  (match (map-get? extended-profiles tx-sender)
    profile
    (begin
      (asserts! (and (>= privacy-level u1) (<= privacy-level u3)) (err ERR-INVALID-INPUT))
      
      (map-set extended-profiles tx-sender
        (merge profile {
          avatar-url: avatar-url,
          location: location,
          website: website,
          social-links: social-links,
          privacy-level: privacy-level,
          updated-at: stacks-block-height
        })
      )
      
      (ok { message: "Profile updated successfully" })
    )
    (err ERR-PROFILE-NOT-FOUND)
  )
)

;; =============================================================================
;; PUBLIC FUNCTIONS - SOCIAL CONNECTIONS
;; =============================================================================

;; Follow a user
(define-public (follow-user (target-user principal))
  (begin
    (asserts! (not (is-eq tx-sender target-user)) (err ERR-SELF-CONNECTION))
    (asserts! (is-none (map-get? user-connections { follower: tx-sender, following: target-user })) 
              (err ERR-CONNECTION-EXISTS))
    
    ;; Create connection
    (map-set user-connections
      { follower: tx-sender, following: target-user }
      { connected-at: stacks-block-height, connection-type: "follow" }
    )
    
    ;; Update statistics
    (update-follower-stats tx-sender target-user true)
    
    ;; Record activity
    (add-user-activity 
      tx-sender 
      "user_follow" 
      "Followed a new user"
      "followed-user"
      true
    )
    
    (ok { follower: tx-sender, following: target-user, message: "User followed successfully" })
  )
)

;; Unfollow a user
(define-public (unfollow-user (target-user principal))
  (let ((connection (map-get? user-connections { follower: tx-sender, following: target-user })))
    (begin
      (asserts! (is-some connection) (err ERR-PROFILE-NOT-FOUND))
      
      ;; Remove connection
      (map-delete user-connections { follower: tx-sender, following: target-user })
      
      ;; Update statistics
      (update-follower-stats tx-sender target-user false)
      
      (ok { message: "User unfollowed successfully" })
    )
  )
)

;; =============================================================================
;; PUBLIC FUNCTIONS - BADGE SYSTEM
;; =============================================================================

;; Create a new badge (contract owner only)
(define-public (create-badge
    (name (string-ascii 50))
    (description (string-ascii 200))
    (icon (string-ascii 100))
    (rarity (string-ascii 20))
  )
  (let ((badge-id (var-get next-badge-id)))
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
      (asserts! (> (len name) u0) (err ERR-INVALID-INPUT))
      
      (map-set user-badges badge-id {
        name: name,
        description: description,
        icon: icon,
        rarity: rarity,
        created-at: stacks-block-height
      })
      
      (var-set next-badge-id (+ badge-id u1))
      
      (ok { badge-id: badge-id, message: "Badge created successfully" })
    )
  )
)

;; Award badge to user (contract owner only)
(define-public (award-badge (user principal) (badge-id uint) (reason (string-ascii 100)))
  (let ((badge (map-get? user-badges badge-id)))
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
      (asserts! (is-some badge) (err ERR-BADGE-NOT-FOUND))
      (asserts! (is-none (map-get? user-badge-ownership { user: user, badge-id: badge-id }))
                (err ERR-INVALID-INPUT))
      
      ;; Award badge
      (map-set user-badge-ownership
        { user: user, badge-id: badge-id }
        { earned-at: stacks-block-height, earned-for: reason }
      )
      
      ;; Update user badge count
      (increment-user-badge-count user)
      
      (ok { user: user, badge-id: badge-id, message: "Badge awarded successfully" })
    )
  )
)

;; =============================================================================
;; PRIVATE HELPER FUNCTIONS
;; =============================================================================

;; Update follower statistics
(define-private (update-follower-stats (follower principal) (following principal) (is-follow bool))
  (let (
    (follower-stats (get-user-stats follower))
    (following-stats (get-user-stats following))
  )
    (begin
      ;; Update follower's following count
      (map-set user-stats follower
        (merge follower-stats {
          following-count: (if is-follow 
            (+ (get following-count follower-stats) u1)
            (- (get following-count follower-stats) u1)
          )
        })
      )
      
      ;; Update following's follower count
      (map-set user-stats following
        (merge following-stats {
          followers-count: (if is-follow 
            (+ (get followers-count following-stats) u1)
            (- (get followers-count following-stats) u1)
          )
        })
      )
    )
  )
)

;; Increment user badge count
(define-private (increment-user-badge-count (user principal))
  (let ((current-stats (get-user-stats user)))
    (map-set user-stats user
      (merge current-stats {
        badge-count: (+ (get badge-count current-stats) u1)
      })
    )
  )
)

;; Add user activity
(define-private (add-user-activity 
    (user principal) 
    (activity-type (string-ascii 30)) 
    (description (string-ascii 200))
    (metadata (string-ascii 300))
    (is-public bool)
  )
  (let (
    (current-stats (get-user-stats user))
    (activity-id (+ (get total-activities current-stats) u1))
  )
    (begin
      ;; Record activity
      (map-set user-activities
        { user: user, activity-id: activity-id }
        {
          activity-type: activity-type,
          description: description,
          metadata: metadata,
          timestamp: stacks-block-height,
          is-public: is-public
        }
      )
      
      ;; Update activity count
      (map-set user-stats user
        (merge current-stats {
          total-activities: activity-id,
          activity-score: (+ (get activity-score current-stats) u1)
        })
      )
    )
  )
)

;; Award system badge (internal use)
(define-private (award-system-badge (user principal) (badge-type (string-ascii 20)) (reason (string-ascii 100)))
  (let ((badge-id (var-get next-badge-id)))
    (begin
      ;; Create the badge
      (map-set user-badges badge-id {
        name: badge-type,
        description: reason,
        icon: "system-badge",
        rarity: "common",
        created-at: stacks-block-height
      })
      
      ;; Award it to the user
      (map-set user-badge-ownership
        { user: user, badge-id: badge-id }
        { earned-at: stacks-block-height, earned-for: reason }
      )
      
      ;; Update counters
      (var-set next-badge-id (+ badge-id u1))
      (increment-user-badge-count user)
      
      (ok badge-id)
    )
  )
)