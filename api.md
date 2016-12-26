# Route

## Get pages

| Method | url | object | description |
|:---:|:---:|:---:|:---:|
| get | / | user | main page |
| get | /register | . | User register page |
| get | /login | user | Login page |


## Get data
| Method | url | body | response | description |
|:---:|:---:|:---:|:---:|:---:|
| post | /register | {username: String, <br/>password: String} |.| If success, then redirect to main page.|
| post | /login | {username: String, <br/>password: String} |.| If success, then redirect to main page.|
