"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function Docs() {
    const [docs, setDocs] = useState([]);

    useEffect(() => {
        const fetchDocs = async () => {
            const token = localStorage.getItem("token");
            const res = await apiRequest("/documents", "GET", null, token);
            setDocs(res);
        };

        fetchDocs();
    }, []);

    return (
        <div>
            <h2>Documents</h2>

            {docs.map((d) => (
                <div key={d.id}>
                    <b>{d.title}</b>
                </div>
            ))}
        </div>
    );
}