from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='static')

# Configure the Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# OLFU Antipolo SHS Information - Enhanced with more details from the provided links
INFO = {
    "strands": {
        "ABM (Accountancy, Business & Management)": (
            "📊 Focus: Business fundamentals and financial management\n\n"
            "Core Subjects:\n"
            "- Principles of Accounting\n"
            "- Business Mathematics\n"
            "- Entrepreneurship\n"
            "- Marketing Principles\n"
            "- Economics\n\n"
            "Unique Features:\n"
            "• Business simulation activities\n"
            "• Financial literacy programs\n"
            "• Industry partnerships with local businesses\n\n"
            "Career Paths:\n"
            "• Certified Public Accountant\n"
            "• Business Analyst\n"
            "• Financial Advisor\n"
            "• Marketing Director\n"
            "• Startup Founder"
        ),
        "STEM (Science, Technology, Engineering & Mathematics)": (
            "🔬 Focus: Advanced scientific inquiry and technological innovation\n\n"
            "Core Subjects:\n"
            "- Calculus with Analytic Geometry\n"
            "- General Physics/Chemistry/Biology\n"
            "- Engineering Design\n"
            "- Robotics & Programming\n\n"
            "Unique Features:\n"
            "• Annual science research fair\n"
            "• Robotics competition team\n"
            "• Partnership with engineering universities\n\n"
            "Career Paths:\n"
            "• Data Scientist\n"
            "• Civil Engineer\n"
            "• Medical Researcher\n"
            "• AI Developer\n"
            "• Aerospace Engineer"
        ),
        "HumSS (Humanities & Social Sciences)": (
            "📚 Focus: Cultural understanding and societal systems\n\n"
            "Core Subjects:\n"
            "- Philippine Politics & Governance\n"
            "- World Religions\n"
            "- Creative Writing\n"
            "- Community Engagement\n"
            "- Media & Information Literacy\n\n"
            "Unique Features:\n"
            "• Model United Nations program\n"
            "• School newspaper editorial team\n"
            "• Community immersion projects\n\n"
            "Career Paths:\n"
            "• Human Rights Lawyer\n"
            "• Clinical Psychologist\n"
            "• International Diplomat\n"
            "• Documentary Filmmaker\n"
            "• Social Media Strategist"
        ),
        "GAS (General Academic Strand)": (
            "🎓 Focus: Flexible multidisciplinary education\n\n"
            "Sample Electives:\n"
            "- Disaster Readiness & Risk Reduction\n"
            "- Applied Economics\n"
            "- Psychology Electives\n"
            "- Creative Industries\n\n"
            "Unique Features:\n"
            "• Customizable course selection\n"
            "• College pathway preparation\n"
            "• Career exploration seminars\n\n"
            "Career Pathways:\n"
            "• Broad preparation for:\n"
            "  - Liberal Arts Degrees\n"
            "  - Entrepreneurship\n"
            "  - Technical-Vocational Programs\n"
            "  - Emerging Industries"
        )
    },
    "requirements": (
        "Here are the admission requirements:\n\n"
        "1. Original Grade 10 Report Card (F-138)\n"
        "2. Original F-137 (claim request letter from OLFU Admissions Office)\n"
        "3. Original or Certified True Copy of Certificate of Junior High School Completion\n"
        "4. Original Certificate of Good Moral Character (issued in the current year)\n"
        "5. Two (2) identical copies of recent studio photo (white background)\n"
        "6. Clear photocopy of PSA Birth Certificate\n"
        "7. Original Education Service Contracting (ESC) Certificate / Qualified Voucher Recipient (QVR) Certificate (if coming from private school)"
    ),
    "misc_fees": (
        "Canvas Account: ₱850\n"
        "   - **Online learning platform access (1 year validity)**\n"
        "   - **Includes 25GB cloud storage**\n"
        "   - **Mandatory for all students**\n\n"

        "Application Fee: ₱1500\n"
        "   - **Non-refundable processing fee**\n"
        "   - **Covers document verification**\n"
        "   - **Valid for one academic year**\n\n"

        "Uniform Set: ₱1200\n"
        "   - **Package includes:**\n"
        "       • 2 OLFU polo shirts (white & blue)\n"
        "       • 1 pair of slacks/skirt\n"
        "       • School necktie/ribbon\n"
        "       • ID lace with safety breakaway clasp**\n\n"

        "PE Uniform: ₱1000\n"
        "   - **Package includes:**\n"
        "       • Moisture-wick OLFU dri-fit shirt\n"
        "       • Athletic shorts with school logo\n"
        "       • Drawstring sports bag\n"
        "   - **Available sizes: XS to XXL**\n"
        "   - **Replacement cost: ₱650/set**"
    ),
    "tuition_fees": (
        "📌 Senior High School Tuition Fees (Antipolo Campus):\n\n"
        "MINIMUM REQUIREMENTS TO ENROLL:\n"
        "Public School Completers | Private School Completers\n"
        "Application Fee: PHP 500 | PHP 500\n"
        "Learning Modality Fee* (per semester): PHP 900 | PHP 900\n"
        "Minimum Down Payment: NONE | PHP 1,500\n"
        "MINIMUM FEE REQUIRED: PHP 1,400 | PHP 2,900*\n\n"
        "*SHS Plus students from public schools follow private school completer fees"
    ),
    "tuition_breakdown": (
        "📌 SHS Tuition Computation Examples:\n\n"
        "A. Voucher Recipient (Public):\n"
        "Initial Fees: ₱1,400\n"
        "Total Tuition: ₱17,500 (Fully covered by voucher)\n\n"
        "B. ESC Grantee (Private):\n"
        "Initial Fees: ₱2,900\n"
        "Total Balance: ₱2,000 after voucher\n\n"
        "C. SHS Plus (Private):\n"
        "Initial Fees: ₱2,900\n"
        "Total Balance: ₱18,500\n\n"
        "D. SHS Plus (Public):\n"
        "Initial Fees: ₱2,900\n"
        "Total Balance: ₱15,000\n\n"
        "E. Non-Voucher Students:\n"
        "Regular: ₱16,000 balance\n"
        "Plus: ₱32,500 balance"
    ),
    "payment_modes": (
        "💳 Payment Options:\n\n"
        "▪ Full Payment (no discounts)\n"
        "▪ Installment Plans:\n"
        "  - Semestral (+₱400)\n"
        "  - Quarterly (+₱800)\n"
        "  - Monthly (+₱1,200)\n\n"
        "Voucher billing is processed through DepEd's schedule"
    ),
    "enrollment_process": (
        "📝 Enrollment Process:\n\n"
        "1. Fill out the Online Registration Form at www.fatima.edu.ph/apply\n"
        "2. Submit Initial Requirements through the Online Portal\n"
        "3. Pay Enrollment Fee via online banking or in-person at campus cashier\n"
        "4. Secure Proof of Payment (receipt/confirmation)\n"
        "5. Submit Complete Admission Requirements to the Admissions Office\n"
        "6. Wait for confirmation email and class schedule\n"
        "7. Attend orientation day for new students"
    ),
    "important_dates": (
        "📅 Important Dates:\n"
        "Enrollment Period: April 1 - June 30, 2025\n"
        "Start of Classes: August 5, 2025\n"
        "Orientation Day: July 15, 2025"
    ),
    "contact_info": (
        "📌 Contact Information:\n"
        "Address: OLFU Antipolo Campus, Sumulong Highway, Antipolo City\n"
        "Phone: (02) 8571-2971\n"
        "Email: shs.admissions@olfu.edu.ph\n"
        "Facebook: www.facebook.com/olfu.antipolo\n"
        "Website: www.fatima.edu.ph"
    ),
    "scholarships": (
        "🎓 Available Scholarships:\n\n"
        "1. Academic Scholarship\n"
        "2. Athletic Scholarship\n"
        "3. Financial Aid\n"
        "4. Honor Students' Scholarship\n"
        "5. Academic Grants\n"
        "6. OLFU Tuition Free Promotion\n"
        "7. Special Talent Grants\n"
        "8. MD2-MD3 Scholarship\n"
        "9. Dentist Parent Privilege Grant"
    ),
    "scholarship_details": (
        "📋 Scholarship Requirements:\n\n"
        "Honor Students' Scholarship:\n"
        "- Top 1/2 in graduating class\n"
        "- Submit Grade 12 Report Card\n"
        "- Certificate of Rank\n"
        "- Good Moral Certificate\n\n"
        "Academic Grants:\n"
        "- Qualifying exam required\n"
        "- Based on GWA and exam results\n\n"
        "OLFU Tuition Free Promotion:\n"
        "- For students with exemplary academic performance\n"
        "- Covers 100% of tuition fees (excluding miscellaneous fees)\n"
        "- Renewable every semester based on grades\n\n"
        "Special Talent Grants:\n"
        "- Available for students with special talents in arts, music, sports\n"
        "- Audition/demonstration required\n"
        "- Partial tuition discount"
    ),
    "faqs": (
        "❓ Frequently Asked Questions:\n\n"
        "Q: Is there an entrance exam?\nA: No entrance exam required for SHS admission\n\n"
        "Q: Are installments available?\nA: Yes, with minimal additional fees\n\n"
        "Q: What is SHS Plus?\nA: Enhanced program with college credits and advanced curriculum\n\n"
        "Q: Can I shift strands after enrollment?\nA: Yes, within the first two weeks of classes, subject to approval\n\n"
        "Q: How do I apply for scholarships?\nA: Submit requirements to the Scholarship Office during enrollment\n\n"
        "Q: Are there dormitories available?\nA: No, but the university can recommend nearby accommodations\n\n"
        "Q: Do you accept transferees?\nA: Yes, subject to credit evaluation and available slots\n\n"
        "Q: What are the school hours?\nA: 7:30 AM - 4:30 PM, Monday through Friday"
    ),
    "facilities": (
        "🏫 Campus Facilities:\n"
        "Library & Learning Resource Center | Medical & Dental Clinic | Computer Laboratories | Science Laboratories | Multimedia Centers | Speech Laboratory | Cafeteria | Student Lounges | Gymnasium & Sports Facilities | Auditorium | Prayer Rooms | Free WiFi Access | Student Activity Centers"
    ),
    "learning_modes": (
        "📚 Learning Modes:\n"
        "Face-to-Face | Blended Learning | Fully Online (Limited Programs)\n\n"
        "All modes use Canvas LMS for course materials, assignments, and assessments. Students in all learning modes have access to:\n"
        "- Digital textbooks and resources\n"
        "- Recorded lectures and demonstrations\n"
        "- Online consultation hours with faculty\n"
        "- Virtual laboratory simulations\n"
        "- Online assessment tools"
    ),
    "shs_voucher_policy": (
        "🎫 Voucher Policy:\n\n"
        "Public School Completers:\n"
        "- Automatic voucher coverage\n"
        "- Full value: ₱17,500 per year\n"
        "- Covers full regular SHS tuition\n\n"
        "Private School Completers:\n"
        "- Submit ESC/QVR certificate\n"
        "- ₱14,000 voucher support per year\n"
        "- Student pays difference of ₱3,500\n\n"
        "Voucher Application Process:\n"
        "1. Public school students: Automatic application\n"
        "2. Private school students: Apply through previous school\n"
        "3. Submit voucher certificate during enrollment\n"
        "4. OLFU processes voucher claims directly with DepEd"
    ),
    "location_details": (
        "📍 OLFU Antipolo Campus Location:\n\n"
        "Full Address:\n"
        "Our Lady of Fatima University\n"
        "Sumulong Highway, Sta. Cruz,\n"
        "Antipolo City, 1870 Rizal\n\n"
        "Landmarks:\n"
        "• Near Antipolo Cathedral\n"
        "• Across Robinsons Place Antipolo\n"
        "• Adjacent to Ace Hardware Antipolo\n\n"
        "Transportation Options:\n"
        "🚌 Jeepneys: Antipolo-Cubao/Marikina routes\n"
        "🚍 UV Express: Tikling/Sta. Lucia-Padang routes\n"
        "🚗 Private Vehicles: Accessible via Marcos Highway\n\n"
        "Parking Information:\n"
        "• Free parking for students\n"
        "• Separate areas for motorcycles and cars\n"
        "• Open 6:00 AM - 8:00 PM daily\n\n"
        "GPS Coordinates: 14.5844° N, 121.1763° E"
    ),
    # New information added from the provided links
    "shs_vision_mission": (
        "🔮 Vision & Mission:\n\n"
        "Vision:\n"
        "OLFU envisions itself as a globally recognized autonomous academic institution rooted in Christian values, a center of excellence in healthcare and other disciplines, and a provider of quality education that transforms lives and communities.\n\n"
        "Mission:\n"
        "OLFU is committed to producing civic-spirited and service-oriented leaders who help in nation building through relevant and progressive research, knowledge development, and community service."
    ),
    "shs_plus_program": (
        "🌟 SHS Plus Program:\n\n"
        "The SHS Plus Program is OLFU's premium senior high school offering that provides:\n\n"
        "- College-level courses that earn credits for future degree programs\n"
        "- Advanced curriculum beyond the basic DepEd requirements\n"
        "- Specialized mentoring from university professors\n"
        "- Priority access to university facilities\n"
        "- Smoother transition to college programs\n"
        "- Enhanced career readiness and preparation\n\n"
        "SHS Plus is available for all strands with slightly higher tuition fees than the regular program, but offers significant advantages for students planning to continue to college at OLFU."
    ),
    "shs_regular_program": (
        "📘 Regular SHS Program:\n\n"
        "The Regular SHS Program follows the standard DepEd curriculum with:\n\n"
        "- Core subjects required for all strands\n"
        "- Specialized subjects based on chosen strand\n"
        "- Work Immersion opportunities\n"
        "- Research projects\n"
        "- Complete DepEd requirements for SHS completion\n\n"
        "The Regular Program is ideal for students who want a solid SHS education at an affordable rate, especially with voucher coverage."
    ),
    "student_life": (
        "🎭 Student Life at OLFU Antipolo:\n\n"
        "Organizations & Clubs:\n"
        "- Student Council\n"
        "- Subject-focused clubs (Math Club, Science Club, etc.)\n"
        "- Arts and cultural organizations\n"
        "- Sports teams\n"
        "- Community service groups\n\n"
        "Annual Events:\n"
        "- University Week celebrations\n"
        "- Intramurals\n"
        "- Cultural festivals\n"
        "- Academic competitions\n"
        "- Career fairs\n\n"
        "Support Services:\n"
        "- Guidance counseling\n"
        "- Academic advising\n"
        "- Student welfare assistance\n"
        "- Health services"
    ),
    "campus_images": {
        "logo": "/static/olfu_logo.png"  # Keep only the logo
    },
    "application_process": (
        "🔄 Application Process:\n\n"
        "1. Online Application\n"
        "   - Visit: www.fatima.edu.ph/apply-senior-high-school\n"
        "   - Complete registration form with accurate information\n"
        "   - Upload required documents\n\n"
        "2. Application Processing\n"
        "   - Application review (1-3 business days)\n"
        "   - Confirmation email with application number\n\n"
        "3. Admission\n"
        "   - No entrance exam required\n"
        "   - Document verification\n"
        "   - Acceptance letter issuance\n\n"
        "4. Enrollment\n"
        "   - Pay initial fees\n"
        "   - Complete medical requirements\n"
        "   - Submit original documents\n"
        "   - Receive student credentials\n\n"
        "5. Orientation\n"
        "   - Mandatory for all new students\n"
        "   - Introduction to university policies\n"
        "   - Campus tour and facility orientation"
    ),
    "voucher_program_details": (
        "📑 SHS Voucher Program Details:\n\n"
        "The Senior High School Voucher Program (SHS VP) is a financial assistance program by DepEd that:\n\n"
        "• Subsidizes tuition and other fees of qualified SHS learners\n"
        "• Enables more students to access private education\n"
        "• Has varying amounts based on location and student category\n\n"
        "OLFU Antipolo Voucher Values:\n"
        "- Public School Completers: ₱17,500/year\n"
        "- Private School Completers with ESC: ₱17,500/year\n"
        "- Private School Completers: ₱14,000/year\n\n"
        "Application Process:\n"
        "• Public JHS completers: Automatic qualification\n"
        "• Private JHS completers: Apply through the ESC system\n"
        "• ESC grantees: Automatic qualification\n\n"
        "Important Reminders:\n"
        "• The voucher is valid for 2 years (SHS duration)\n"
        "• Non-transferable between students\n"
        "• Valid only at DepEd-certified SHS providers like OLFU"
    ),
    "shs_curriculum": (
        "📚 SHS Curriculum Overview:\n\n"
        "Core Curriculum (for all strands):\n"
        "• Oral Communication\n"
        "• Reading and Writing\n"
        "• 21st Century Literature\n"
        "• Contemporary Philippine Arts\n"
        "• Media and Information Literacy\n"
        "• General Mathematics\n"
        "• Statistics and Probability\n"
        "• Earth and Life Science\n"
        "• Physical Science\n"
        "• Introduction to Philosophy\n"
        "• Physical Education and Health\n"
        "• Personal Development\n\n"
        "Each strand then has specific specialized subjects relevant to their focus area. All students also complete Research/Capstone Projects and Work Immersion modules before graduation."
    )
}

# Define system prompt for Gemini
SYSTEM_PROMPT = """
You are a helpful chatbot for Our Lady of Fatima University (OLFU) Antipolo Campus, specifically for their Senior High School program.

IMPORTANT RULES:
1. ONLY answer questions related to OLFU Antipolo Senior High School.
2. If the question is not related to OLFU Antipolo Senior High School, respond with: "I'm sorry, I can only provide information about Our Lady of Fatima University Antipolo's Senior High School programs and services."
3. Be concise but informative in your responses.
4. Use a friendly, helpful tone appropriate for speaking with prospective students and parents.
5. If you're not sure about something, don't make up information - just say you don't have that specific information.
6. Include relevant emojis to make your responses engaging.
7. If asked about location, provide the location details as text from the information provided.
8. If asked about campus facilities or how the campus looks, provide the facilities information as text only.
9. Ask user for their name and email first before answering queries.
10. Address them based on their actual name during the conversation.
11. "Your information is safe! We'll only use your name/email to help with your inquiry."
Add this when collecting personal details.
12.  "For detailed assistance, you can reach our Admissions Office at (02) 8441-9141 or antipolo.shs@olfu.edu.ph!".
13. "While I'd love to chat about other topics, my focus is helping you with OLFU Antipolo SHS matters! 😊"
For persistent off-topic attempts. 


Use the information provided to you about OLFU Antipolo's Senior High School program, including:
- Academic strands (ABM, STEM, HUMSS, GAS)
- SHS Plus and Regular programs
- Vision and mission
- Admission requirements and application process
- Tuition fees and other costs
- Enrollment process
- Scholarship opportunities
- Campus facilities and location
- Contact information
- Student life and organizations
- Curriculum overview

Your purpose is to help students and parents learn about OLFU Antipolo's Senior High School offerings and guide them through the admission process.
"""

# Create a Gemini model
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=genai.GenerationConfig(
        temperature=0.7,
        top_p=0.95,
        top_k=40,
        max_output_tokens=4096,
    ),
    safety_settings=[
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ],
)

# Create chat history
chat = model.start_chat(history=[])


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    user_message = request.json.get('message', '')

    # Format our knowledge base as context
    context = "Information about OLFU Antipolo Senior High School:\n\n"
    for key, value in INFO.items():
        if isinstance(value, dict):
            context += f"{key}:\n"
            for sub_key, sub_value in value.items():
                context += f"  {sub_key}: {sub_value}\n\n"
        else:
            context += f"{key}: {value}\n\n"

    # Create prompt with context and system instructions
    prompt = f"""
    {SYSTEM_PROMPT}

    Here is information about OLFU Antipolo Senior High School that you should use to answer:
    {context}

    User question: {user_message}
    """

    # Get response from Gemini
    try:
        response = chat.send_message(prompt)
        bot_response = response.text

        # Keep only the logo image, no facility or location images
        images = []

        # Check if the response should include location information
        if any(location_term in user_message.lower() for location_term in
               ["location", "address", "where", "map", "directions", "how to get there"]):
            # Only include the text information, no map image
            bot_response += f"\n\nHere's our exact location information:\n{INFO['location_details']}"

        # Check if the user is asking about campus images or facilities
        if any(image_term in user_message.lower() for image_term in
               ["campus", "building", "facilities", "look like", "pictures", "photos", "images"]):
            # Only include the text information, no facility images
            bot_response += f"\n\nHere's information about our campus facilities:\n{INFO['facilities']}"

    except Exception as e:
        print(f"Error with Gemini API: {e}")
        bot_response = "I'm sorry, I'm having trouble processing your request right now. Please try again later."
        images = []

    return jsonify({"response": bot_response, "images": images})


# Modify the campus_images endpoint to only return the logo
@app.route('/api/campus_images', methods=['GET'])
def campus_images():
    return jsonify({"images": {"logo": INFO["campus_images"]["logo"]}})


# Create setup function to prepare directories and files
def setup_files():
    # Create static folder for CSS, JS, and images
    if not os.path.exists('static'):
        os.makedirs('static')

    # Create templates folder for HTML
    if not os.path.exists('templates'):
        os.makedirs('templates')

    # Create a placeholder logo file
    logo_svg = '''
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#0a5c36"/>
      <text x="50" y="55" font-family="Arial" font-size="16" text-anchor="middle" fill="white">OLFU</text>
      <text x="50" y="70" font-family="Arial" font-size="8" text-anchor="middle" fill="white">ANTIPOLO</text>
    </svg>
    '''

    with open('static/olfu_logo.png', 'wb') as f:
        f.write(logo_svg.encode('utf-8'))

    # Create .env file for API key
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write('GEMINI_API_KEY=your_gemini_api_key_here')

    print("Setup complete! Replace 'your_gemini_api_key_here' in the .env file with your actual API key.")


if __name__ == '__main__':
    setup_files()
    app.run(debug=True)