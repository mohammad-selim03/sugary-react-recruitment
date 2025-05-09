Sugary React Recruitment Task

Welcome to my submission for the Frontend Developer (React)recruitment task! This project demonstrates a fully functional React application with authentication, dashboard features, lazy-loaded materials, and a clean, user-friendly UI — all built with a focus on performance, structure, and usability.


Live Demo

 [Live Site on Vercel](https://sugary-react-recruitment-task.netlify.app/)  
 [GitHub Repository](https://github.com/mohammad-selim03/sugary-react-recruitment)


 Features

 Authentication
- Secure login using JWT access and refresh tokens
- Automatic token renewal with session persistence
- Auth-guarded routes and protected dashboard

 Dashboard
- Lazy-loaded list of Materials on materials page fetched from API
- Overview of products
- Each material card includes title, brand, and dynamic pricing
- Fully responsive and mobile-friendly

 Favourite &  Cart Functionality
- Add items to favourites with visual feedback
- Add to cart with quantity and subtotal calculation
- Persistent state with context and localStorage

 UI/UX
- Built with TailwindCSS for rapid and consistent styling
- Clean, modern design with interactive states and transitions
- Thoughtful layout, loading indicators, and error handling

 

 -Tech Stack 
  
 -React  for  UI and state management     
 -React Router for Navigation and route protection  
 -Tailwind CSS for Design system and layout    
 -Axios for HTTP requests and API integration   
 -React Hot Toast for  Toast notifications     
 -Vercel  for Deployment           


 -API Integration

Base URLs:
- API: `https://sugarytestapi.azurewebsites.net`
- Images: `https://d1wh1xji6f82aw.cloudfront.net`

Sample Endpoints Used:

- `POST /AdminAccount/Login` – Login & retrieve tokens
- `POST /Account/RefreshToken` – Token renewal
- `GET /Materials/GetAll/` – Material list with pagination (`filter` query encoded in base64)

Base64 Filter Example:
```json
{
  "Skip": 0,
  "Limit": 20,
  "Types": [1]
}
