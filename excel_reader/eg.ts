export default [
    {
        "parent_type": "writing",
        "type": "email_responder",
        "order": "Write a response to the customer's email that is both personalized and efficient.",
        "inputs": [
            {
                "label": "Customer's email",
                "example": "e.g. Hi,I'm interested in your product"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "crazy_character",
        "order": "Rewrite the text in a way that makes it sound like the speaker is crazy or mad.",
        "inputs": [
            {
                "label": "Text to modify",
                "example": "e.g. I'm feeling great today！"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "identify_the_main_target_audience",
        "order": "Identify the primary audience of the article or essay about the topic.",
        "inputs": [
            {
                "label": "Article or essay",
                "example": "e.g. The effects of global warming"
            },
            {
                "label": "Topic",
                "example": "e.g. Climate change"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "hypothesis_generator",
        "order": "Generate a hypothesis based on the research question provided.",
        "inputs": [
            {
                "label": "Research question",
                "example": "e.g. What are the effects of social media on mental health？"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "improve_text",
        "order": "Rewrite the text in a concise and grammatically correct way, while still conveying the same meaning.",
        "inputs": [
            {
                "label": "Text",
                "example": "e.g. This text needs to be improved"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "emulate_the_writing_style",
        "order": "Input text will be rewritten to imitate the style of the mimic text.",
        "inputs": [
            {
                "label": "Input text",
                "example": "e.g. The quick brown fox jumps over the lazy dog"
            },
            {
                "label": "Mimic text",
                "example": "e.g. a short piece from your favourite novel"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "introduction_to_a_story_or_novel",
        "order": "Write an introduction to the story, novel, or novel chapter, following the specified summary, tone and instructions.",
        "inputs": [
            {
                "label": "Summary",
                "example": "e.g. 'A young girl discovers a magical world'"
            },
            {
                "label": "Instructions",
                "example": "e.g. 'Include quote from the protagonist','Introduce the main character'"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "creating_a_narrative_gradually",
        "order": "Write a section for the story based on the given summary that fits logically with the plot of “Before plot” and “Before section” before the summary, and “Next plot” after the summary.",
        "inputs": [
            {
                "label": "Summary",
                "example": "e.g. The hero discovers a secret"
            },
            {
                "label": "Before plot",
                "example": "e.g. The hero goes on a journey"
            },
            {
                "label": "Before section",
                "example": "e.g. The hero meets a guide"
            },
            {
                "label": "Next plot",
                "example": "e.g. The hero defeats the villain"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "ielts_writing_aid",
        "order": "This tool will improve your ideas to relate to the topic, re-correct your grammar errors, expand your lexical resource and enhance your coherence and cohesion. It will help you to upgrade your essay to band 9 IELTS.",
        "inputs": [
            {
                "label": "Essay topic",
                "example": "e.g. Discuss the advantages and disadvantages of living in a large city"
            },
            {
                "label": "Text",
                "example": "e.g. There is no doubt that living in a large city has many benefits,for example..."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "reflective_essay",
        "order": "Write a reflective essay on the specified topic or using the provided draft.",
        "inputs": [
            {
                "label": "Topic or draft",
                "example": "e.g. Through face-to-face meetings and discussions, I developed strategies to understand my team member and appreciate the group’s diversity."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "combine_texts",
        "order": "Merge the two texts into one combined text.",
        "inputs": [
            {
                "label": "Text one",
                "example": "e.g. The first text"
            },
            {
                "label": "Text two",
                "example": "e.g. The second text"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "story_creator",
        "order": "Write a story in paragraph form on the chosen topic, including characters and plot elements.",
        "inputs": [
            {
                "label": "Story topic or prompt",
                "example": "e.g. A journey to a magical world"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "storytelling_genius",
        "order": "Generate a creative story with elements such as a plot that has a conflict and resolution, characters, a setting, a theme, and the protagonist overcomes three obstacles to get to the resolution based on the prompt and guidelines given.",
        "inputs": [
            {
                "label": "Prompt",
                "example": "e.g. A young girl discovers a magical world"
            },
            {
                "label": "Genre",
                "example": "e.g. Fiction, Contemporary Fiction,Mystery, Fairy Tale/Fable/Folktale, Fantasy...etc."
            },
            {
                "label": "Setting",
                "example": "e.g. temporal, environmental, and individual, backyard, farm, garden, house, park...etc. "
            },
            {
                "label": "Book title and Characters Name",
                "example": "e.g. characters names "
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "automated_blogging",
        "order": "Write a unique article about the topic.",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. Autonomous vehicles"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "opening_paragraph_for_a_chapter",
        "order": "Write an opening paragraph for a chapter in an ebook. ",
        "inputs": [
            {
                "label": "Initial prompt",
                "example": "e.g. humorous"
            },
            {
                "label": "Style",
                "example": "e.g. humorous"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "realistic_reactions_from_characters.",
        "order": "Write a realistic response based on the character's personality and traits given the specified situation.",
        "inputs": [
            {
                "label": "Character",
                "example": "e.g. Harry Potter"
            },
            {
                "label": "Situation",
                "example": "e.g. Being offered a job"
            },
            {
                "label": "Character traits",
                "example": "e.g. Brave,Intelligent,Loyal"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "writer_of_the_prompt",
        "order": "Write a 400-600 character story or oneshot using the given prompt.",
        "inputs": [
            {
                "label": "Prompt",
                "example": "e.g. A group of adventures find themselves lost in a cave..."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "outline_of_a_movie_script",
        "order": "Create an outline for a movie script, including:\n- Plot points\n- Character descriptions\n- Scene descriptions",
        "inputs": [
            {
                "label": "Genre",
                "example": "e.g. Aciton/Adventure"
            },
            {
                "label": "Setting",
                "example": "e.g. A small town in the Midwest"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "template_for_a_blog_post",
        "order": "Create a blog post template, including:\n-A catchy title\n-An introduction to the topic\n-Body paragraphs outlining the main points\n-A conclusion summarizing the key points\n-A call to action",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. The Benefits of Meditation"
            },
            {
                "label": "Introduction",
                "example": "e.g. Meditation has been around for centuries..."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "phrase_creator",
        "order": "Generate related terms based on the given keyword.",
        "inputs": [
            {
                "label": "Keyword",
                "example": "e.g. Car"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "outline_of_a_book",
        "order": "Create a table of contents and outline for the specified book.",
        "inputs": [
            {
                "label": "Book title",
                "example": "e.g. Enter value here..."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "father's_day_card_creator",
        "order": "Write a thoughtful and well-written Father's Day card based on the notes or ideas.",
        "inputs": [
            {
                "label": "Notes or ideas",
                "example": "e.g. Thanks for always bing there for me,I love doing_with you"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "paragraph_expander",
        "order": "Expand the existing idea into a high quality paragraph.",
        "inputs": [
            {
                "label": "Existing idea or writing",
                "example": "e.g. Paste or type here!"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "re_stater",
        "order": "Reword and rephrase the original text while retaining its meaning.",
        "inputs": [
            {
                "label": "Original text",
                "example": "e.g. The quick brown fox jumped over the lazy dog"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "sympathy_email",
        "order": "Write a sympathy email for the coworker, expressing understanding and support during this difficult time.",
        "inputs": [
            {
                "label": "Recipient",
                "example": "e.g. John"
            },
            {
                "label": "Occasion",
                "example": "e.g. Loss of a family member"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "creator_of_mother's_day_cards",
        "order": "Write a thoughtful and well-written Mother's Day card based on the notes or ideas.",
        "inputs": [
            {
                "label": "Notes or Ideas",
                "example": "e.g. Thank you for all your do, I love spending time with you and ________"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "quote_locator",
        "order": "Extract the key quotes from the text and format them into a readable list.",
        "inputs": [
            {
                "label": "Text",
                "example": "e.g. Paste text here"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "message",
        "order": "Write a clear, formal and polite letter to the recipient about the specified subject and purpose.",
        "inputs": [
            {
                "label": "Recipient",
                "example": "e.g. John"
            },
            {
                "label": "Subject",
                "example": "e.g. Invitation"
            },
            {
                "label": "Purpose",
                "example": "e.g. Requesting a meeting"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "ai_speech_writer",
        "order": "Write a speech using the given outline, topic, and sources/quotes.",
        "inputs": [
            {
                "label": "Outline",
                "example": "e.g. Introduction, Body, Conclusion"
            },
            {
                "label": "Topic",
                "example": "e.g. Education"
            },
            {
                "label": "Sources/Quotes",
                "example": "Sources or quotes to include in the speech"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "request_letter",
        "order": "Write a polite, clear, concise letter of request.",
        "inputs": [
            {
                "label": "Recipient",
                "example": "e.g. John Smith"
            },
            {
                "label": "Request",
                "example": "e.g. Can you please help me with my project? Request for repairs?"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "updates_from_the_project_manager",
        "order": "Provide a clear, simple, and concise update as a project manager for the given project.",
        "inputs": [
            {
                "label": "Project update background",
                "example": "e.g. The project is on track"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "communication_with_clients",
        "order": "Compose a message to the client, in a simple, professional, and concise manner.",
        "inputs": [
            {
                "label": "Message Content",
                "example": "e.g. We have completed the project."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "write_a_concise_manuscript.",
        "order": "Write a detailed, optimistic manuscript describing the chosen topic, with examples of any steps.",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. A new way to think about climate change"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "comprehensive_framework_for_a_book_or_article",
        "order": "Create a detailed outline of the specified chapter, taking into account the specified title.",
        "inputs": [
            {
                "label": "Title",
                "example": "e.g. My life story"
            },
            {
                "label": "Chapter topic/background",
                "example": "e.g. Overcoming adversity"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "develop_press_release",
        "order": "Write a press release for the company including:\n-The headline\n-A description of the press release\n-Quotes from key figures\n-Any other pertinent information",
        "inputs": [
            {
                "label": "Company name",
                "example": "e.g. Acme Inc."
            },
            {
                "label": "Headline",
                "example": "e.g. Acme Inc. Launches New Product"
            },
            {
                "label": "Description",
                "example": "e.g. Acme Inc. has launched a new product that revolutionizes the industry"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "examine_the_substance",
        "order": "Analyse the content and provide an answer.",
        "inputs": [
            {
                "label": "Content",
                "example": "e.g. What is the theme of this text: ______"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "reply_to_an_email",
        "order": "Write a polite and informative reply to the email received.",
        "inputs": [
            {
                "label": "Subject",
                "example": "e.g. Meeting Invite"
            },
            {
                "label": "Email received content",
                "example": "e.g. Hi there!"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "writing_assistant_for_multiple_languages.",
        "order": "Write a full draft of the requested content in the desired language.",
        "inputs": [
            {
                "label": "Requested content",
                "example": "e.g. Article about visiting Paris"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "autowrite_in_any_language_with_flexibility",
        "order": "Write a complete output in the specified language for the specified task.",
        "inputs": [
            {
                "label": "Task to complete",
                "example": "e.g. Write an introduction to a blog post about Artificial Intelligence"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "detailed_article_writer",
        "order": "Write a detailed article on the given topic, covering:\n-Overview of the topic\n-History\n-Applications\n-Pros and Cons\n-Future Outlook",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. Artificial Intelligence"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "writing_an_article",
        "order": "Write a detailed article on the specified topic.",
        "inputs": [
            {
                "label": "Title",
                "example": "e.g. The benefits of yoga"
            },
            {
                "label": "Topic",
                "example": "e.g. Yoga"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "provider_of_analogies",
        "order": "Find an analogy that relates to the given statement.",
        "inputs": [
            {
                "label": "Statement",
                "example": "e.g. Learning is like building a house"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "community_health_worker_note",
        "order": "A paragraph summarizing the visit, including the purpose, interventions, response, referral, and plan discussed during visit.",
        "inputs": [
            {
                "label": "Purpose",
                "example": "Purpose of visit/problem addressed"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "issue_statements",
        "order": "Create an announcement for the specified course about the specified type of announcement.",
        "inputs": [
            {
                "label": "Announcement type",
                "example": "Concept introduction"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "autowrite_with_style_that_is_adaptable",
        "order": "Write the text in the specified style or in the style of the specified author.",
        "inputs": [
            {
                "label": "What to write?",
                "example": "e.g. write an overview of artificial intelligence"
            },
            {
                "label": "Writing style",
                "example": "e.g. Shakespeare or casual"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "sentence_expander",
        "order": "Expand the sentence based on the provided idea. Write in short easy to understand sentences. Use simple or everyday English words.",
        "inputs": [
            {
                "label": "Start sentence",
                "example": "e.g. I want to go to the beach"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "summary_of_the_key_points",
        "order": "Generate a summary of the article in the form of a bulleted list of top 3-5 main points.",
        "inputs": [
            {
                "label": "Article",
                "example": "e.g. Link to the article"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "provide_suggestion_on_writing",
        "order": "Make comments and suggestions on the paper to help improve the writing.",
        "inputs": [
            {
                "label": "Content",
                "example": "e.g. My essay"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "response_to_the_discussion_post",
        "order": "Write a comment on the post, offering suggestions to improve it.",
        "inputs": [
            {
                "label": "Discussion post",
                "example": "e.g. I think that..."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "conclusion_creator",
        "order": "Write a conclusion that summarizes the main topic or argument and leaves the reader with something to think about.",
        "inputs": [
            {
                "label": "Topic/Central Argument",
                "example": "e.g. Social media has a negative impact on communication"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "create_a_letter_to_formally_resign",
        "order": "Generate a formal letter of resignation for the specified employer and job title, with the desired notice period and last day of work.",
        "inputs": [
            {
                "label": "Name",
                "example": "e.g. John Smith"
            },
            {
                "label": "Employer Name",
                "example": "e.g. XYZ Inc."
            },
            {
                "label": "Position Title",
                "example": "e.g. Software Engineer"
            },
            {
                "label": "Notice Period",
                "example": "e.g. 2 weeks"
            },
            {
                "label": "Last Day of Work",
                "example": "e.g. 01/01/2020"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "writer_of_grant_proposals",
        "order": "Write a grant proposal that clearly outlines the project’s goals, objectives, and funding requirements.",
        "inputs": [
            {
                "label": "Project name",
                "example": "e.g. Wildlife conservation"
            },
            {
                "label": "Project Goals",
                "example": "e.g. Increase public awareness of the need for wildlife conservation"
            },
            {
                "label": "Project Objectives",
                "example": "e.g. Create a series of educational videos about wildlife conservation"
            },
            {
                "label": "Funding Requirements",
                "example": "e.g. $10,000 for video production costs"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "storytelling_innovator",
        "order": "Generate a creative story with the specified genre and setting.",
        "inputs": [
            {
                "label": "Genre",
                "example": "e.g. Fantasy"
            },
            {
                "label": "Setting",
                "example": "e.g. Post-apocalyptic world"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "summarize_from_link",
        "order": "Summarize the article or webpage",
        "inputs": [
            {
                "label": "Link to article or webpage",
                "example": "e.g. https://openai.com/blog/chatgpt-plugins"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "transform_writing_into_a_more_natural_style",
        "order": "Rewrite the text to make it sound less robotic, more natural and human.",
        "inputs": [
            {
                "label": "Text input",
                "example": "e.g. Paste your text here"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "commitment",
        "order": "Write a personalized dedication to the specified person.",
        "inputs": [
            {
                "label": "Name",
                "example": "e.g. John"
            },
            {
                "label": "Relation",
                "example": "e.g. Best Friend"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "re_write_for_details_and_clarity",
        "order": "Rewrite the sentence to add details and clarity. Expand on the sentence to make complete paragraphs with more information, up to 800 words.",
        "inputs": [
            {
                "label": "Sentence",
                "example": "e.g. I saw a cat"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "create_a_phrase_or_saying",
        "order": "Generate a quote about the specified topic.",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. Life"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "adaptable_writing_mentor",
        "order": "Write a draft of the requested writing task or fulfill the user's request.",
        "inputs": [
            {
                "label": "Writing task",
                "example": "e.g. Compose a draft for a proposal on XYZ"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "professional_writing_assistant",
        "order": "Provide expert advice and assistance on the specified writing task.",
        "inputs": [
            {
                "label": "Writing task",
                "example": "e.g. Examples:\n\n- Write a convincing introduction to my essay about why Artificial Intelligence is the future of work\n- Creative title ideas for my essay about AI\n- Improve this sentence: AI is going to change the way we work"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "phrase_abbreviated",
        "order": "Write a shorter tweet that conveys the same meaning as the original tweet.",
        "inputs": [
            {
                "label": "Tweet",
                "example": "e.g. 'This is a really long tweet that needs to be shortened'"
            },
            {
                "label": "Target length",
                "example": "e.g. 140 characters"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "paraphraser",
        "order": "A paraphrased version of the input text that is clearer and easier to understand.",
        "inputs": [
            {
                "label": "Input text",
                "example": "e.g. This is an example of input text"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "rephrase_to_alter_the_tone",
        "order": "A written piece with the specified tone that reflects the topic provided.",
        "inputs": [
            {
                "label": "Writing topic",
                "example": "e.g. e.g. My experience in the City"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "write_an_executive_summary",
        "order": "A short paragraph executive summary of the text with headers",
        "inputs": [
            {
                "label": "Text to summarize",
                "example": "e.g. e.g. The company XYZ is a leading provider of..."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "enhance_the_paragraph",
        "order": "A rewritten paragraph that includes action and detail.",
        "inputs": [
            {
                "label": "Paragraph to rewrite",
                "example": "e.g. This was an amazing experience."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "email_enhancement",
        "order": "A proofread and improved version of the specified email.",
        "inputs": [
            {
                "label": "Email",
                "example": "e.g. What is the email you want to proofread and improve?"
            },
            {
                "label": "Style",
                "example": "Formal, casual, concise"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "editor_with_magical_abilities",
        "order": "An edited version of the text with improved clarity, tone, and style.",
        "inputs": [
            {
                "label": "Writing",
                "example": "Ex. He went to the store and buyed some donuts. They are incredibly delicious and he ate them all."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "rewrite_content",
        "order": "The original content rephrased so that the original structure and content are still there but it's now better in the way the instructions ask",
        "inputs": [
            {
                "label": "Original content",
                "example": "The quick brown fox jumps over the lazy dog"
            },
            {
                "label": "Instructions",
                "example": "Make it more engaging, to simplify it, etc."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "create_a_storyline",
        "order": "A detailed outline of a story, coving the setting and each part of the plot.",
        "inputs": [
            {
                "label": "Genre",
                "example": "Ex. Mystery, Romance, Sci-Fi, Fantasy, etc."
            },
            {
                "label": "Main character",
                "example": "Ex. Name, age, occupation, personality, etc."
            },
            {
                "label": "Setting",
                "example": "Ex. Location, time period, historical or fictional context, etc."
            },
            {
                "label": "Conflict",
                "example": "Ex. A murder mystery, a forbidden love, a quest for a treasure, etc."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "create_essay_outline",
        "order": "A basic outline for the essay including:\n-Introduction\n-Body paragraphs\n-Conclusion",
        "inputs": [
            {
                "label": "Topic",
                "example": "Ex. The effects of social media on mental health"
            },
            {
                "label": "Thesis Statement\n\n",
                "example": "Ex. Social media has a negative impact on mental health by increasing stress, anxiety, and depression among users"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "create_essay_introduction",
        "order": "An introduction paragraph for an academic essay.\n\nThe introduction paragraph should provide some background information, context, or relevance of the topic or question. The introduction paragraph should also state the main argument or claim of the essay, which is the thesis. The introduction paragraph should end with a transition sentence that leads to the body paragraphs.",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. Global warming"
            },
            {
                "label": "Thesis",
                "example": "Global warming is caused by human activities and has serious consequences for the environment and society"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "create_an_essay_conclusion",
        "order": "A concluding paragraph restating the thesis, summarizing the essay's main points, and leaving a lasting impression on the reader.",
        "inputs": [
            {
                "label": "Essay topic",
                "example": "e.g. The benefits of online education"
            },
            {
                "label": "Essay thesis",
                "example": "Online education is a flexible, accessible, and affordable option for learners of all ages and backgrounds"
            },
            {
                "label": "Essay summary",
                "example": "Online education allows learners to choose their own pace, schedule, and location; online education provides learners with a variety of courses and resources from different institutions and experts; online education reduces the costs and barriers associated with traditional education"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "create_conversation",
        "order": "A dialogue between two or more characters based on the given scenario.",
        "inputs": [
            {
                "label": "Scenario",
                "example": "Ex. Alice and Bob are on their first date at a restaurant "
            },
            {
                "label": "Characters",
                "example": "Ex. Alice is a shy and nervous librarian, Bob is a confident and charming lawyer"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "remix_made_to_order",
        "order": "The rewritten text based on the given instruction.",
        "inputs": [
            {
                "label": "Text",
                "example": "e.g. Paste the test to be rewritten here"
            },
            {
                "label": "Instruction",
                "example": "e.g. Change the tone to be more formal and use more advanced language"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "inquiry_letter",
        "order": "A concise letter of inquiry, introducing your project and goals",
        "inputs": [
            {
                "label": "Recipient",
                "example": "e.g. ABC foundation"
            },
            {
                "label": "Subject",
                "example": "e.g. Funding for XYZ Project"
            },
            {
                "label": "Introduction",
                "example": "e.g. I am writing to inquire about the possibility of receiving funding for XYZ project"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "historical_fiction_generator",
        "order": "A historical fiction story based on the specified inputs with dialogue",
        "inputs": [
            {
                "label": "Time period",
                "example": "e.g. e.g. Ancient Rome"
            },
            {
                "label": "Main character",
                "example": "e.g. Leonidas"
            },
            {
                "label": "Conflict",
                "example": "e.g. A fight against an oppressive regime"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "essay_title",
        "order": "A catchy title for the essay that captures its topic and purpose.",
        "inputs": [
            {
                "label": "Essay topic",
                "example": "e.g. Climate change"
            },
            {
                "label": "Short summary",
                "example": "France is a country in Western Europe whose history dates back to the Middle Ages. It has been a major power in Europe since the 1700s, when it became a major player in the politics, culture and economics of the region. Over the centuries, France has gone through several changes, from its monarchy to the French Revolution and its subsequent Republic, to the modern-day Fifth Republic. Throughout its history, France has been a major contributor to the development of the world, making significant contributions in science, art, politics, education, and philosophy."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "create_names",
        "order": "A list of cool names of the specified type and length.",
        "inputs": [
            {
                "label": "Korean names",
                "example": "e.g. female names"
            },
            {
                "label": "Korean names",
                "example": "e.g.10"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "to_enhance_the_story's_fluidity",
        "order": "A well-edited story with a strong narrative flow, written in the preferred writing style.",
        "inputs": [
            {
                "label": "Story content",
                "example": "e.g. The story of a brave knight saving the kingdom."
            },
            {
                "label": "Preferred Writing Style",
                "example": "e.g. Casual, Formal, etc."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "discussion_post",
        "order": "A response post to the discussion post that addresses the original post.",
        "inputs": [
            {
                "label": "Discussion post",
                "example": "e.g. I think..."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "comment_on_the_text",
        "order": "A comment on the book content with analysis, suggestions and recommendations",
        "inputs": [
            {
                "label": "Book content",
                "example": "e.g. Introduction to Learning"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "expand_a_thriller_like_text",
        "order": "A thrilling piece of text which includes the given entry, with added details, characters and their appearance, temperament, attitude and personality, places and description of the environment, if possible, dialogues on the main issues at stake and perspectives on the topic.",
        "inputs": [
            {
                "label": "Text to rewrite",
                "example": "e.g. John walks into a dark alley..."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "demonstrate_rather_than_explain",
        "order": "A rewritten version of the text in strong visual elements.",
        "inputs": [
            {
                "label": "Text",
                "example": "e.g. The sun was setting in the sky"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "filling_content",
        "order": "A filled in version of the content, with the AI filling in where the 'XXX' was.",
        "inputs": [
            {
                "label": "Content",
                "example": "e.g. Artificial intelligence is changing the world. It is impacting XXX. "
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "grammar_checking_software",
        "order": "A corrected version of the entered text, free of any spelling, grammar, or punctuation errors",
        "inputs": [
            {
                "label": "Text",
                "example": "Ex. Its a well kown fact that dogs are mans best friend."
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "genuine_responses",
        "order": "How a character would feel and act based on the writen situlation",
        "inputs": [
            {
                "label": "Situation",
                "example": "e.g. Reacions"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "artificial_intelligence_based_writer",
        "order": "Content written by AI about the specified topic in the specified format.",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. Artificial Intelligence"
            },
            {
                "label": "Type",
                "example": "e.g. Blog Post"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "phrase_amplifier",
        "order": "A well-crafted message, written in the appropriate tone for the given platform/purpose.",
        "inputs": [
            {
                "label": "Message draft",
                "example": "e.g. Paste or write an initial draft or summary of the message intent"
            },
            {
                "label": "Platform/Purpose",
                "example": "e.g. formal business email or casual informative discord message"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "produce_a_multitude_of_sounds",
        "order": "A piece of writing that uses vivid language, metaphors and symbols, and rhythm to explore the spiritual aspects of life and convey themes of love, compassion, and understanding.",
        "inputs": [
            {
                "label": "Theme",
                "example": "e.g. Love, Compassion, Understanding"
            },
            {
                "label": "Vivid language",
                "example": "e.g. Glittering stars, Soft wind"
            },
            {
                "label": "Metaphors and symbols",
                "example": "e.g. A dove for peace, A rose for love"
            },
            {
                "label": "Rhythm",
                "example": "e.g. Rhyme, Repetition, Assonance"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "assistance_with_grammar",
        "order": "An answer to the specified grammar question.",
        "inputs": [
            {
                "label": "Grammar question",
                "example": "e.g. What is the past tense of run?"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "automaton_of_lovecraft",
        "order": "Macabre text in the style of H.P Lovecraft",
        "inputs": [
            {
                "label": "Subject/Key concepts\n\n",
                "example": "e.g. Plot, concepts, spooky poems"
            },
            {
                "label": "Genre",
                "example": "e.g. Story, poem, description, style reinvention"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "harry_potter_fanfiction",
        "order": "A detailed and engaging piece of fanfiction about the specified character in the specified genre, taking into account the setting and additional details.",
        "inputs": [
            {
                "label": "Characters",
                "example": "e.g. Harry Potter and Hermione Granger"
            },
            {
                "label": "Genre",
                "example": "e.g. Romance"
            },
            {
                "label": "Setting",
                "example": "e.g. The Hufflepuff common room"
            },
            {
                "label": "Additional details",
                "example": "e.g. the characters find a three-headed dog"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "write_like_shakespeare",
        "order": "Generated text in the style of Shakespear.",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. AI and space"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "enhancer_of_writing_skills",
        "order": "The text with improved grammar, advanced vocabulary, and beautiful prose.",
        "inputs": [
            {
                "label": "Text to improve",
                "example": "e.g. Tom was a regular office worker who liked to follow his routine every day. He woke up at 6:30, had a toast and coffee for breakfast, took the bus to his job at the accounting firm, worked on his spreadsheets and reports, had a sandwich and salad for lunch, worked some more, took the bus back home, cooked some pasta and chicken for dinner, watched some TV, and went to bed by 10. He did not have any hobbies, interests, friends, or family to spice up his life. He was content with his simple and predictable existence, and never thought of changing anything. He did not know that one day, something unexpected would happen that would turn his world upside down"
            }
        ]
    },
    {
        "parent_type": "writing",
        "type": "paraphrasing_tool",
        "order": "A high quality paragraph based on the provided topic or text.",
        "inputs": [
            {
                "label": "Topic",
                "example": "e.g. The role of AI in the future of writing"
            }
        ]
    }
]