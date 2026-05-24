# Portfolio Backend

This is the FastAPI backend for the contact form of your portfolio website, ready to be deployed on Vercel.

## Folder Structure

```
backend/
├── api/
│   ├── __init__.py        # Optional, makes api a module
│   └── main.py            # FastAPI application and routes
├── .env                   # Local environment variables (DO NOT COMMIT)
├── .env.example           # Example environment variables
├── requirements.txt       # Python dependencies
└── vercel.json            # Vercel deployment configuration
```

## Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `.env` (or create a `.env` file) and add your credentials:
   ```
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   ```

3. **Run the server locally:**
   ```bash
   uvicorn api.main:app --reload
   ```

## Getting a Gmail App Password

To send emails using Gmail SMTP securely, you must generate an App Password. Do not use your regular account password.

1. Go to your **Google Account** settings (https://myaccount.google.com/).
2. Navigate to the **Security** tab on the left panel.
3. Under "How you sign in to Google", ensure **2-Step Verification** is turned ON.
4. Once 2-Step Verification is enabled, search for **App passwords** in the top search bar of your Google Account.
5. In the App passwords section:
   - Provide a custom name like "Portfolio Backend".
   - Click **Create**.
6. Google will generate a 16-character password. Copy this password; you won't be able to see it again.
7. Use this 16-character password as your `GMAIL_APP_PASSWORD` environment variable.

## Vercel Deployment Instructions

Follow these exact steps to deploy your FastAPI backend to Vercel:

1. **Push to GitHub**:
   Ensure your entire `backend` folder (or your whole portfolio repository) is pushed to a GitHub repository.

2. **Import Project to Vercel**:
   - Go to [Vercel](https://vercel.com/) and log in.
   - Click **Add New** > **Project**.
   - Import your GitHub repository.

3. **Configure the Project**:
   - If your backend is in a subfolder (e.g., `backend`), set the **Root Directory** to `backend`.
   - The Framework Preset should be automatically detected, but you can leave it as "Other".

4. **Add Environment Variables**:
   In the Vercel project configuration page (before clicking Deploy), expand the **Environment Variables** section. Add the following keys:
   - Key: `GMAIL_USER` | Value: `your_email@gmail.com`
   - Key: `GMAIL_APP_PASSWORD` | Value: `your_16_character_app_password`

   *(If you've already deployed, you can add these in the Vercel Dashboard -> Settings -> Environment Variables, and then redeploy).*

5. **Deploy**:
   - Click **Deploy**. Vercel will use `vercel.json` and `api/main.py` to deploy your FastAPI backend as a serverless function.

## Example curl Request for Testing

You can test your deployed (or local) endpoint using the following `curl` command. Replace `http://localhost:8000` with your Vercel project URL once deployed.

```bash
curl -X POST http://localhost:8000/contact \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Jane Doe",
           "email": "jane@example.com",
           "subject": "Freelance Project Inquiry",
           "message": "Hello, I would like to discuss a potential project with you.",
           "website_honeypot": ""
         }'
```

*Note: The `website_honeypot` must remain an empty string. If filled, the server assumes it is a bot and will quietly ignore the request while returning a success response.*
