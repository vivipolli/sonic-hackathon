"""
This file contains the prompt templates used for generating content in various tasks.
These templates are formatted strings that will be populated with dynamic data at runtime.
"""

#Twitter prompts
POST_TWEET_PROMPT =  ("Generate an engaging tweet. Don't include any hashtags, links or emojis. Keep it under 280 characters."
                      "The tweets should be pure commentary, do not shill any coins or projects apart from {agent_name}. Do not repeat any of the"
                      "tweets that were given as the examples. Avoid the words AI and crypto.")

REPLY_TWEET_PROMPT = ("Generate a friendly, engaging reply to this tweet: {tweet_text}. Keep it under 280 characters. Don't include any usernames, hashtags, links or emojis. ")


#Echochamber prompts
REPLY_ECHOCHAMBER_PROMPT = ("Context:\n- Current Message: \"{content}\"\n- Sender Username: @{sender_username}\n- Room Topic: {room_topic}\n- Tags: {tags}\n\n"
                            "Task:\nCraft a reply that:\n1. Addresses the message\n2. Aligns with topic/tags\n3. Engages participants\n4. Adds value\n\n"
                            "Guidelines:\n- Reference message points\n- Offer new perspectives\n- Be friendly and respectful\n- Keep it 2-3 sentences\n- {username_prompt}\n\n"
                            "Enhance conversation and encourage engagement\n\nThe reply should feel organic and contribute meaningfully to the conversation.")


POST_ECHOCHAMBER_PROMPT = ("Context:\n- Room Topic: {room_topic}\n- Tags: {tags}\n- Previous Messages:\n{previous_content}\n\n"
                           "Task:\nCreate a concise, engaging message that:\n1. Aligns with the room's topic and tags\n2. Builds upon Previous Messages without repeating them, or repeating greetings, introductions, or sentences.\n"
                           "3. Offers fresh insights or perspectives\n4. Maintains a natural, conversational tone\n5. Keeps length between 2-4 sentences\n\nGuidelines:\n- Be specific and relevant\n- Add value to the ongoing discussion\n- Avoid generic statements\n- Use a friendly but professional tone\n- Include a question or discussion point when appropriate\n\n"
                           "The message should feel organic and contribute meaningfully to the conversation."
                           )

# Mental Health Analysis prompts
ANALYZE_BEHAVIOR_PROMPT = ("Context:\n"
                         "- Behavior Description: \"{behavior}\"\n"
                         "- Trigger Situations: \"{antecedent}\"\n"
                         "- Consequences & Benefits: \"{consequence}\"\n"
                         "- Previous Attempts: \"{previous_attempts}\"\n"
                         "- Current Progress: {daily_progress}%\n"
                         "- Daily Reflection: \"{daily_reflection}\"\n\n"
                         "Task:\n"
                         "1. Analyze the behavioral pattern considering:\n"
                         "   - Frequency and intensity of the behavior\n"
                         "   - Specific triggers and environmental factors\n"
                         "   - Short-term and long-term consequences\n"
                         "   - Impact on daily functioning and well-being\n"
                         "2. Consider previous attempts and their outcomes\n"
                         "3. Evaluate current progress and daily reflections\n"
                         "4. Identify potential barriers to change\n\n"
                         "Guidelines:\n"
                         "- Be specific and evidence-based in your analysis\n"
                         "- Focus on patterns and relationships between triggers and behaviors\n"
                         "- Consider both challenges and strengths shown in previous attempts\n"
                         "- Incorporate insights from daily progress and reflections\n\n"
                         "The analysis should provide a foundation for suggesting personalized, actionable habits.")

SUGGEST_HABITS_PROMPT = ("Based on the behavioral analysis:\n"
                        "- Pattern: {behavior_pattern}\n"
                        "- Triggers: {identified_triggers}\n"
                        "- Impact: {behavior_impact}\n"
                        "- Current Progress: {progress_data}\n\n"
                        "Create a personalized set of daily habits that:\n"
                        "1. Address the root causes identified in the analysis\n"
                        "2. Build on successful elements from previous attempts\n"
                        "3. Consider the patient's current routine and capabilities\n"
                        "4. Provide clear implementation steps\n\n"
                        "For each suggested habit, include:\n"
                        "1. Title and clear description\n"
                        "2. Specific frequency and duration\n"
                        "3. Expected benefits based on behavioral science\n"
                        "4. Step-by-step implementation guide\n"
                        "5. Progress tracking metrics\n"
                        "6. Potential obstacles and solutions\n"
                        "7. Scientific references or evidence base\n\n"
                        "Format each habit as a structured object that can be tracked in the habits dashboard.\n"
                        "Focus on creating sustainable, measurable changes that align with the patient's goals and capabilities.")
