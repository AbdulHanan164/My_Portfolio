from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import aiosmtplib
from email.message import EmailMessage
from datetime import datetime
import os
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Portfolio Contact API", version="1.0.0")

# Setup Rate Limiter (using client IP)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS Middleware
# Allowing all origins for ease of testing, but you should restrict this to your domain in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to ["https://yourdomain.com", "http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Model for incoming contact requests
class ContactForm(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Sender's name")
    email: EmailStr = Field(..., description="Sender's valid email address")
    subject: str = Field(..., min_length=2, max_length=200, description="Subject of the email")
    message: str = Field(..., min_length=10, max_length=5000, description="Email body content")
    # Honeypot field for spam bots. If a bot fills this out, the request is silently ignored.
    website_honeypot: str = Field(default="", description="Leave empty. Used for bot protection.")

async def send_email_async(contact_data: ContactForm, client_ip: str):
    """
    Asynchronously sends an email using Gmail SMTP and aiosmtplib.
    """
    gmail_user = os.getenv("GMAIL_USER")
    gmail_app_password = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_app_password:
        raise Exception("Server configuration error: Gmail credentials not set.")

    # Construct the email message
    msg = EmailMessage()
    msg['Subject'] = f"Portfolio Contact: {contact_data.subject}"
    msg['From'] = gmail_user
    msg['To'] = gmail_user  # Send to yourself
    msg['Reply-To'] = contact_data.email

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Email body format
    body = f"""
    New Contact Form Submission from Portfolio

    -----------------------------------------
    Timestamp: {timestamp}
    Client IP: {client_ip}
    -----------------------------------------

    Name: {contact_data.name}
    Email: {contact_data.email}
    Subject: {contact_data.subject}

    Message:
    {contact_data.message}
    """
    msg.set_content(body)

    # Connect to Gmail SMTP securely and send
    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=465,
        use_tls=True,
        username=gmail_user,
        password=gmail_app_password
    )

@app.post("/api/contact")
@limiter.limit("5/minute") # Rate limiting to prevent spam floods
async def contact(request: Request, form: ContactForm):
    """
    Endpoint to receive contact form submissions and send an email.
    """
    # 1. Honeypot check
    if form.website_honeypot != "":
        # If the honeypot is filled, act like it succeeded to fool the bot
        return {"status": "success", "message": "Message received."}

    client_ip = get_remote_address(request) or "Unknown IP"

    try:
        # 2. Send email asynchronously
        await send_email_async(form, client_ip)
        return {"status": "success", "message": "Email sent successfully!"}
    
    except Exception as e:
        # Log the error internally (not implemented here for brevity, but a print works for basic logging)
        print(f"Error sending email: {e}")
        # Return a clean 500 error to the client
        raise HTTPException(status_code=500, detail="Failed to send email due to an internal server error.")

@app.get("/api")
def read_root():
    return {"message": "Portfolio Contact API is running."}
