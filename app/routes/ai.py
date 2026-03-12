from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import openai
import os
from app.models.models import User, DiaryEntry, Lecture
from app import db

ai_bp = Blueprint("ai", __name__)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

@ai_bp.route("/suggest-content", methods=["POST"])
@jwt_required()
def suggest_content():
    """AI-powered content suggestions for teaching"""
    try:
        data = request.get_json()
        subject = data.get('subject')
        topic = data.get('topic')
        department = data.get('department')
        
        prompt = f"""
        You are an expert curriculum designer for {department} department.
        
        For the subject "{subject}" and topic "{topic}", provide:
        
        1. 5 specific content items that should be covered (practical and detailed)
        2. Optimal teaching sequence (beginner to advanced)
        3. Key learning objectives for students
        4. Common difficulties students face with this topic
        5. Suggested teaching methods or activities
        
        Format your response as JSON with this structure:
        {{
            "content_items": ["item1", "item2", "item3", "item4", "item5"],
            "teaching_sequence": ["step1", "step2", "step3"],
            "learning_objectives": ["objective1", "objective2", "objective3"],
            "common_difficulties": ["difficulty1", "difficulty2"],
            "teaching_methods": ["method1", "method2"]
        }}
        """
        
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert educational curriculum designer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        return jsonify({
            "success": True,
            "suggestions": response.choices[0].message.content
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ai_bp.route("/analyze-progress", methods=["POST"])
@jwt_required()
def analyze_progress():
    """AI analysis of teaching progress and recommendations"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Get user's entries from last 30 days
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        entries = DiaryEntry.query.filter(
            DiaryEntry.user_id == user_id,
            DiaryEntry.created_at >= thirty_days_ago
        ).all()
        
        # Prepare data for analysis
        subjects_covered = {}
        total_hours = 0
        topics_covered = []
        
        for entry in entries:
            subject = entry.subject
            if subject not in subjects_covered:
                subjects_covered[subject] = {
                    'entries': 0,
                    'topics': [],
                    'avg_progress': 0
                }
            
            subjects_covered[subject]['entries'] += 1
            subjects_covered[subject]['avg_progress'] += entry.syllabus_percent
            
            if entry.lectures:
                for lecture in entry.lectures:
                    if lecture.topic:
                        subjects_covered[subject]['topics'].append(lecture.topic)
                        topics_covered.append(f"{subject}: {lecture.topic}")
                        total_hours += lecture.duration / 60
        
        # Calculate averages
        for subject in subjects_covered:
            if subjects_covered[subject]['entries'] > 0:
                subjects_covered[subject]['avg_progress'] /= subjects_covered[subject]['entries']
        
        analysis_data = {
            'teacher_name': user.name,
            'department': user.department,
            'total_entries': len(entries),
            'total_teaching_hours': round(total_hours, 1),
            'subjects_covered': subjects_covered,
            'recent_topics': topics_covered[-10:]  # Last 10 topics
        }
        
        prompt = f"""
        Analyze this teacher's progress data from the last 30 days and provide insights:
        
        Teacher: {analysis_data['teacher_name']} ({analysis_data['department']})
        Total Entries: {analysis_data['total_entries']}
        Teaching Hours: {analysis_data['total_teaching_hours']}
        Subjects: {list(subjects_covered.keys())}
        Recent Topics: {analysis_data['recent_topics']}
        
        Provide analysis in JSON format:
        {{
            "overall_performance": "assessment of teaching consistency and progress",
            "strengths": ["strength1", "strength2"],
            "areas_for_improvement": ["area1", "area2"],
            "recommendations": ["recommendation1", "recommendation2"],
            "next_suggested_topics": ["topic1", "topic2"],
            "pacing_feedback": "feedback on teaching pace"
        }}
        """
        
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert educational analyst and mentor for college teachers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        return jsonify({
            "success": True,
            "analysis": response.choices[0].message.content,
            "data": analysis_data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ai_bp.route("/generate-report", methods=["POST"])
@jwt_required()
def generate_report():
    """Generate AI-powered progress reports"""
    try:
        data = request.get_json()
        report_type = data.get('type', 'individual')  # individual, department, summary
        user_id = get_jwt_identity()
        
        if report_type == 'individual':
            # Generate individual teacher report
            user = User.query.get(user_id)
            entries = DiaryEntry.query.filter_by(user_id=user_id).all()
            
            # Prepare comprehensive data
            report_data = {
                'teacher': user.name,
                'department': user.department,
                'total_entries': len(entries),
                'subjects': {},
                'monthly_progress': {}
            }
            
            # Process entries for detailed analysis
            for entry in entries:
                # Add to report data
                pass
            
            prompt = f"""
            Generate a comprehensive progress report for this teacher:
            {report_data}
            
            Include:
            1. Executive summary
            2. Subject-wise progress analysis
            3. Teaching consistency metrics
            4. Recommendations for improvement
            5. Goals for next month
            
            Format as a professional report.
            """
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional educational report writer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5
            )
            
            return jsonify({
                "success": True,
                "report": response.choices[0].message.content
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ai_bp.route("/smart-search", methods=["POST"])
@jwt_required()
def smart_search():
    """Natural language search through diary entries"""
    try:
        data = request.get_json()
        query = data.get('query')
        user_id = get_jwt_identity()
        
        # Get user's entries
        entries = DiaryEntry.query.filter_by(user_id=user_id).all()
        
        # Convert entries to searchable text
        entries_text = []
        for entry in entries:
            entry_text = f"Date: {entry.date}, Subject: {entry.subject}, "
            if entry.lectures:
                topics = [lecture.topic for lecture in entry.lectures if lecture.topic]
                entry_text += f"Topics: {', '.join(topics)}, "
            entry_text += f"Progress: {entry.syllabus_percent}%, Remarks: {entry.remarks}"
            entries_text.append(entry_text)
        
        prompt = f"""
        User query: "{query}"
        
        Search through these diary entries and find relevant matches:
        {entries_text[:20]}  # Limit for token usage
        
        Return matching entries with explanations in JSON format:
        {{
            "matches": [
                {{
                    "entry_id": "id",
                    "relevance": "why this matches",
                    "summary": "brief summary"
                }}
            ],
            "interpretation": "what the user was looking for"
        }}
        """
        
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a smart search assistant for educational diary entries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        return jsonify({
            "success": True,
            "results": response.choices[0].message.content
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500