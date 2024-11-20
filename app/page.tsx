"use client";

import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useState } from "react";

export default function Home() {
  const [typeformApiKey, setTypeformApiKey] = useState<string>("");
  const [questionsData, setQuestionsData] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const createForm = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/typeform/create-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: typeformApiKey,
          formInput: questionsData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        console.error("Error creating form:", errorData.error);

        alert(`Failed to create form: ${errorData.error}`);
      } else {
        const formResult = await response.json();

        console.log("Form created successfully:", formResult);

        alert(`Form created successfully! Form ID: ${formResult.id}`);
      }
    } catch (error) {
      console.error("Unexpected error:", error);

      alert("An unexpected error occurred while creating the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="flex flex-col gap-3 w-full max-w-xl">
        <Input
          isReadOnly={loading}
          label="Typeform API key"
          value={typeformApiKey}
          onChange={(e) => {
            setTypeformApiKey(e.target.value);
          }}
        />
        <Textarea
          isReadOnly={loading}
          label="Questions"
          maxRows={30}
          minRows={10}
          placeholder="Type or paste your form title, questions and answers here. Currently we only support multiple choice questions"
          value={questionsData}
          onChange={(e) => {
            setQuestionsData(e.target.value);
          }}
        />
        <Button
          isLoading={loading}
          radius="md"
          variant="shadow"
          onClick={createForm}
        >
          Generate Form
        </Button>
      </div>
    </section>
  );
}
