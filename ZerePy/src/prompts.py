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
ANALYZE_AND_SUGGEST_PROMPT = ("""Functional behavioral analysis based on radical behaviorism and intervention technique suggestions [or habits]

BEHAVIORAL DATA:
- Current behavior you want to analyze: "{behavior}"
- Context or environment in which the behavior occurs: "{antecedent}"
- Immediate consequences of the analyzed behavior (what happens right after the behavior): "{consequence}"
- Previous attempts to change the analyzed behavior: "{previous_attempts}"

INSTRUCTIONS:
1. First, perform a functional analysis based on radical behaviorism and show the behavioral pattern considering:
* The context/environment in which the behavior occurs and the immediate consequence of the behavior
- Frequency and intensity of the behavior
- Other contexts/environments where the same behavior occurs
- Short and long-term consequences
- Behavioral excesses and deficits resulting from the established pattern
- Impact on daily functioning
- Potential barriers to change
- Strengths from previous attempts

2. Based on this analysis, suggest 3-4 practical habits. For each habit, provide:
- Habit name: short and clear title
- Description: brief explanation of the habit
- Implementation: detailed step-by-step execution
- Scientific basis: reference or evidence supporting this habit

RESPONSE FORMAT (please use this format and the exact keywords - DO NOT CHANGE THE WORD 'Habits:'):
GENERAL:
[Behavioral analysis, more than 3 paragraphs]

Habits:
1. **[Habit name]**
   - **Description:** [brief description]
   - **Implementation:** [detailed steps]
   - **Scientific Basis:** [reference or evidence]

[Repeat format for each suggested habit]

IMPORTANT: You MUST use exactly "Habits:" as the section header for the habits list. Do not use any other variations like "Recommended habits", "Suggested habits", etc. The exact keyword "Habits:" is required for proper parsing of the response.""")

# Test version of the prompt (simplified)
TEST_ANALYZE_PROMPT = ("Analyze this behavior and suggest habits:\n\n"
                      "BEHAVIOR:\n"
                      "- Current: {behavior}\n"
                      "- Context: {antecedent}\n"
                      "- Results: {consequence}\n"
                      "- Past tries: {previous_attempts}\n\n"
                      "Please analyze and suggest 3 habits. Use exactly 'Habits:' as header.\n\n"
                      "Format:\n"
                      "GENERAL:\n"
                      "[Brief analysis]\n\n"
                      "Habits:\n"
                      "1. **[Name]**\n"
                      "   - **Description:** [brief]\n"
                      "   - **Implementation:** [steps]\n"
                      "   - **Scientific Basis:** [evidence]")
