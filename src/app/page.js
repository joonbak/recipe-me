"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const handlePost = async () => {
    try {
      setError(null);
      if (message === "") {
        return alert("Please enter a recipe URL.");
      }
      setIsLoading(true);
      const fetchResponse = await fetch("/api/recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      });
      const jsonData = await fetchResponse.json();
      if (Object.keys(jsonData.message).length === 0) {
        setError("This is not a recipe website.");
        return;
      }
      setData(jsonData.message);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching the recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Recipe Parser</h1>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-row items-center justify-center w-full">
          <Input
            className="min-w-[300px]"
            placeholder="Enter recipe URL..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handlePost();
              }
            }}
          />
          <Button onClick={handlePost}>Enter</Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 mt-4">
        {error && <p className="text-red-500">{error}</p>}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin" />
            <p>Generating recipe... This may take a few seconds.</p>
          </div>
        ) : (
          data && (
            <Card className="max-w-2xl w-full">
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                {data.ingredients?.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient
                      .split("**")
                      .map((part, i) =>
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                  </li>
                ))}
              </CardContent>
              <CardHeader>
                <CardTitle>Steps</CardTitle>
              </CardHeader>
              <CardContent>
                {data.steps?.map((step, index) => (
                  <li key={index} className="list-decimal">
                    {step
                      .split("**")
                      .map((part, i) =>
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                  </li>
                ))}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
