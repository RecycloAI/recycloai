# recycloai



# ♻️ RecycloAI: AI for Waste Management

**RecycloAI** is an AI-powered waste management system that helps reduce landfill waste and promotes a circular economy through intelligent sorting, data analytics, and community engagement.


## 🌱 Project Overview

RecycloAI uses AI and computer vision to automate waste classification, optimize collection routes, and provide insightful analytics to support environmentally responsible waste management. Our mission is to drive sustainability through technology and empower communities to recycle smarter.


## 🚀 Features

- 🧠 **AI-Powered Waste Sorting**: Detect and classify different waste types (plastic, paper, metal, organic, etc.).
- 📊 **Analytics Dashboard**: View trends in waste disposal and recycling rates.
- 📦 **Predictive Waste Collection**: Forecast bin fill levels and optimize pickup routes.
- 🧭 **Circular Economy Guidance**: Recommend disposal, recycling, and reuse options.
- 👥 **Community Engagement**: User accounts, recycling tips, and gamified rewards.


## 🧑‍💻 Tech Stack

- **Backend**: Django (Python)
- **Frontend**: React or Django Templates
- **Database**: PostgreSQL
- **Machine Learning**: TensorFlow / PyTorch (for image classification)
- **Cloud/Deployment**: Docker, Heroku/AWS/GCP (planned)
- **Optional Hardware**: Raspberry Pi + Camera (for real-time smart bins)


## 👥 Team Members & Roles

| Name             | Reg No.                                 | Role                                        |
|------------------|--------------------------------------|----------------------------------------------------------|
| Josiah Ndirangu  | SCT  | ML models, Django backend, architecture                 |
| Geofrey Gitau    | Frontend Developer                   | UI/UX, frontend integration, user dashboard             |
| Daniel Wekesa    | Data Engineer                        | Data pipelines, model training, waste dataset handling  |
| Bonface          | DevOps & Deployment                  | Docker, CI/CD, cloud setup                              |



## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/recycloai.git
cd recycloai
````

### 2. Set Up a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # For Linux/macOS
venv\Scripts\activate     # For Windows
```

### 3. Install Requirements

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/recycloai_db
```

### 5. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Run the Development Server

```bash
python manage.py runserver
```

Visit [http://localhost:8000](http://localhost:8000) in your browser.


## 📦 Sample Waste Dataset

We use public image datasets of recyclable and non-recyclable waste for model training. More info in the [`/data`](./data) folder.


## 🧪 Tests

Run tests using:

```bash
python manage.py test
```


## 📁 Project Structure (WIP)

```
recycloai/
├── core/                  # Django apps
├── ai_model/              # Waste classifier models
├── templates/             # Frontend templates
├── static/                # CSS/JS/image assets
├── media/                 # Uploaded waste images
├── requirements.txt
├── manage.py
└── README.md
```


## 🔍 Roadmap

* [x] Django backend setup
* [x] ML model for waste classification
* [ ] Frontend integration
* [ ] Real-time smart bin integration
* [ ] Deploy to cloud platform
* [ ] Launch community mobile app


## 📄 License

Not yet licensed.


## 🌐 Connect With Us

For partnerships, collaboration, or feedback, contact **[recycloai20@gmail.com]**.

