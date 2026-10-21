Auth
Register: POST /auth/register (name, email, password)

{
  "name": "Raghvendra Gohar",
  "email": "raghvendra@example.com",
  "password": "securepassword123"
}

Login: POST /auth/login (email, password)
{
  "email": "raghvendra@example.com",
  "password": "securepassword123"
}

copy token by login

Profile: GET /auth/me

Teams
Create Team: POST /teams (name)
{
  "name": "Engineering Team"
}

List Teams: GET /teams (token)

Add Member: POST /teams/:teamId/members (email, role)

{
  "email": "raghv@example.com",
  "role": "MEMBER"
}

Tasks
Create Task: POST /tasks (title, description, priority, status, teamId, dueDate, checklist)
{
  "title": "Design Database Schema",
  "description": "Create Prisma models for users, teams, and tasks.",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "teamId": "5edc1eb8-9d1d-4250-8bbc-e728036f49b7",
  "dueDate": "2026-12-31T23:59:59.000Z",
  "checklist": [
    { "text": "Draft User model", "completed": true }
  ]
}

List Tasks: GET /tasks?page=1&limit=10&status=TODO&priority=HIGH&search=keyword

Get Task: GET /tasks/:id

Update Task: PATCH /tasks/:id

{
  "status": "DONE",
  "priority": "MEDIUM"
}

Delete Task: DELETE /tasks/:id
