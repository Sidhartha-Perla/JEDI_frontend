import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (import.meta.env.DEV) {
  const mockInterviews = [
    {
      id : 1,
      title: "Website Usability Test",
      objective: "Evaluate the usability of website",
      status: "draft",
      questions: [
        "How easy was it to navigate the website?",
        "Did you find all the information you were looking for?",
        "What improvements would you suggest?"
      ],
      responses : 10,
      created_date : "2025-04-14T10:30:00Z"
    },
    {
      id : 2,
      title: "Feature Adoption Survey",
      objective: "Implement risk assessment",
      status: "active",
      questions: [
        "How often do you use this feature?",
        "What barriers prevent you from using this feature?",
        "How would you rate the usefulness of this feature?"
      ],
      responses : 10,
      created_date : "2025-04-13T10:30:00Z"
    },
    {
      id : 3,
      title: "Brand Perception Study",
      objective: "Conduct connector strategic plan",
      status: "active",
      questions: [
        "How would you describe our brand in three words?",
        "What values do you associate with our brand?",
        "How does our brand compare to competitors?"
      ],
      responses : 10,
      created_date : "2025-04-15T10:30:00Z"
    },
    {
      id : 4,
      title: "Concept Testing",
      objective: "Discuss /issue questions",
      status: "completed",
      questions: [
        "What are your first impressions of this concept?",
        "How likely would you be to use this product?",
        "What would prevent you from adopting this solution?"
      ],
      responses : 10,
      created_date : "2025-04-14T11:30:00Z"
    },
    {
      id : 5,
      title: "Customer Satisfaction Poll",
      objective: "Test out value action",
      status: "active",
      questions: [
        "How satisfied are you with our product?",
        "What aspects do you like most about our product?",
        "What aspects need improvement?"
      ],
      responses : 10,
      created_date : "2025-03-14T10:30:00Z"
    },
    {
      id : 6,
      title: "Constust sedback",
      objective: "Conduct the interview",
      status: "completed",
      questions: [
        "What challenges are you facing with our product?",
        "How can we make the onboarding process better?",
        "Would you recommend our product to others?"
      ],
      responses : 10,
      created_date : "2025-05-14T10:30:00Z"
    }
  ];

  const originalFetch = window.fetch;
  window.fetch = async (url, options) => {
    if (url.match(/\/api\/interviews\/\d+$/)) {
      const id = parseInt(url.split('/').pop());
      const interview = mockInterviews.find(i => i.id === id);
      
      if (interview) {
        return new Response(JSON.stringify(interview), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      } else {
        return new Response(JSON.stringify({ error: 'Interview not found' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
    }

    if (url.startsWith('/api/interviews')) {
      const urlObj = new URL(url, window.location.origin);
      const status = urlObj.searchParams.get('status');

      let data = mockInterviews;
      if (status) {
        data = data.filter((i) => i.status === status);
      }

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Mock AI chat response
    if (url === '/api/ai/chat') {
      const body = JSON.parse(options.body);
      return new Response(
        JSON.stringify({ response: `Echo: ${body.message}` }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return originalFetch(url, options);
  };
}

createRoot(document.getElementById('root')).render(<App/>);
