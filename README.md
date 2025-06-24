# Book Review API

A simple RESTful backend API built with Node.js, Express, and PostgreSQL (via Prisma ORM).  
Users can sign up, log in, create books, write reviews, and explore existing entries.

---

## Tech Stack

- **Node.js + Express** for the web server
- **PostgreSQL** for the database
- **Prisma** as the ORM
- **JWT** for authentication
- **bcrypt** for password hashing

---

## 🛠 Project Setup

1. **Clone the repo:**

```bash
git clone https://github.com/yourusername/book-review-api.git
cd book-review-api
```
2. **Install Dependencies:**

```bash
npm install
```

3. **Set Up Environment Variables:**
Create a .env file in the root:

```bash
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/book_review_api
JWT_SECRET=your_super_secret_key
```

4. **Run Database Migration:**
   
```bash
npx prisma migrate dev
```
5. **Start The Server:**

```bash
npm run start
```

---

## Example API Requests

### 1. Signup

**POST** `http://localhost:3000/api/users/signup`
**Headers:**

* `Content-Type: application/json`

**Body:**

```json
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123"
}
```

---

### 2. Login

**POST** `http://localhost:3000/api/users/login`
**Headers:**

* `Content-Type: application/json`

**Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Note:** Copy the `token` from the response for use in authorized requests.

---

### 3. Create a Book

**POST** `http://localhost:3000/api/books`
**Headers:**

* `Content-Type: application/json`
* `Authorization: Bearer <your_token_here>`

**Body:**

```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "genre": "Self-Help"
}
```

---

### 4. Get All Books (with Pagination and Filters)

**GET** `http://localhost:3000/api/books?page=1&limit=5&author=james&genre=self-help`

---

### 5. Get Book Details (with Reviews and Average Rating)

**GET** `http://localhost:3000/api/books/<book_id>`

Replace `<book_id>` with the actual ID of a book returned from the previous request.

---

### 6. Submit a Review for a Book

**POST** `http://localhost:3000/api/books/<book_id>/reviews`
**Headers:**

* `Content-Type: application/json`
* `Authorization: Bearer <your_token_here>`

**Body:**

```json
{
  "content": "Incredible read. Super practical.",
  "rating": 5
}
```

---

### 7. Update a Review

**PUT** `http://localhost:3000/api/reviews/<review_id>`
**Headers:**

* `Content-Type: application/json`
* `Authorization: Bearer <your_token_here>`

**Body:**

```json
{
  "content": "Updated review: even better the second time.",
  "rating": 4
}
```

---

### 8. Delete a Review

**DELETE** `http://localhost:3000/api/reviews/<review_id>`
**Headers:**

* `Authorization: Bearer <your_token_here>`

---

## Database Schema

### 1. User
   
| Field    | Type   | Notes              |
| -------- | ------ | ------------------ |
| id       | String | Primary Key        |
| email    | String | Unique             |
| username | String | Unique             |
| password | String | Hashed with bcrypt |

### 1. Book

| Field       | Type   | Notes        |
| ----------- | ------ | ------------ |
| id          | String | Primary Key  |
| title       | String |              |
| author      | String |              |
| genre       | String |              |
| createdById | String | FK → User.id |


### 1. Review

| Field   | Type   | Notes                                |
| ------- | ------ | ------------------------------------ |
| id      | String | Primary Key                          |
| content | String |                                      |
| rating  | Int    | 1–5                                  |
| userId  | String | FK → User.id                         |
| bookId  | String | FK → Book.id, UNIQUE(userId, bookId) |

NOTE: FK = Foreign Key
