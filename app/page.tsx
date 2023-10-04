"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { z } from "zod";
import { Input } from "../components/ui/input";
import Spacer from "../components/spacer";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { getDatabase, ref, set } from "firebase/database";
import firebaseApp from "../firebase";
import { useEffect } from "react";
import jwt from "jsonwebtoken";

const formSchema = z.object({
  registration: z.string(),
  message: z.string(),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      registration: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const db = getDatabase(firebaseApp);

    // uuid v4 generate
    const messageId = Math.random().toString(36).substring(7);

    await set(ref(db, "messages/" + messageId), {
      mensagem: values.message,
      matricula: values.registration,
      sistema: true,
      data: new Date().toISOString(),
    });
  };

  useEffect(() => {
    const localToken = localStorage.getItem("token");

    if (localToken !== null) {
      const token = jwt.verify(
        localToken,
        String(process.env.NEXT_PUBLIC_LOCAL_SECRET)
      ) as {
        user: string;
        iat: number;
      };

      if (token.user === process.env.NEXT_PUBLIC_LOCAL_USER) return;
    }

    const user = prompt("Usuário");
    const password = prompt("Senha");

    if (
      user !== process.env.NEXT_PUBLIC_LOCAL_USER ||
      password !== process.env.NEXT_PUBLIC_LOCAL_PASSWORD
    ) {
      alert("Usuário ou senha incorretos");
      window.location.href = "/";
    }

    try {
      const token = jwt.sign(
        { user },
        String(process.env.NEXT_PUBLIC_LOCAL_SECRET)
      );

      localStorage.setItem("token", token);
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-3xl font-bold">Enviar mensagem</h1>
      <Spacer />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="registration"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Spacer />

          <FormField
            name="message"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensagem</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Spacer />

          <Button className="w-40" type="submit">
            Enviar
          </Button>
        </form>
      </Form>
    </main>
  );
}
