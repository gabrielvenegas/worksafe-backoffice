"use client";

import { getDatabase, ref, onValue } from "firebase/database";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";
import firebaseApp from "../firebase";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function IncomingMessages() {
  const [messages, setMessages] = useState<
    {
      id: string;
      matricula: string;
      sistema: boolean;
      mensagem: string;
      data: string;
    }[]
  >([]);

  const db = getDatabase(firebaseApp);

  useEffect(() => {
    const messages = ref(db, "messages");

    onValue(messages, (snapshot) => {
      const data = snapshot.val();

      const messages = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      const usersMessages = messages.filter((message) => !message.sistema);
      const sortedMessages = usersMessages.sort((a, b) =>
        b.data.localeCompare(a.data)
      );

      setMessages(sortedMessages);
    });
  }, []);

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold">Mensagens recebidas</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Matricula</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Mensagem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell>{message.matricula}</TableCell>
              <TableCell>
                {dayjs(message.data).format("DD/MM/YYYY HH:mm:ss")}
              </TableCell>
              <TableCell>{message.mensagem}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
