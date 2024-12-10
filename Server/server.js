const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS for all routes

const GOOGLE_API_KEY = "AIzaSyAqJYa2xMkba83PElWZpecwKGNOyHUu8fo";
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/recipeStream", async (req, res) => {
    const { ingredients, cuisineType, cookingTime, difficulty, mealType } = req.query;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    };

    try {
        const prompt = [
            "Generate a recipe that includes the following details:",
            `[Ingredients: ${ingredients}]`,
            `[Meal Type: ${mealType}]`,
            `[CookingTime: ${cookingTime}]`,
            `[Difficulty: ${difficulty}]`,
            `[CuisineType: ${cuisineType}]`,
            "Provide a recipe using the ingredients and details provided with steps for prep and cooking, without mentioning its fictional",
            "Provide a name and a short background of the dish including where it may have originated from as well as history of the dish."
        ].join(" ");

        const result = await model.generateContent(prompt);


        const generatedText = result.response.text();


        sendEvent({ action: "chunk", chunk: generatedText });


        sendEvent({ action: "close" });

        res.end();
    } catch (error) {
        console.error("Error during stream:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
