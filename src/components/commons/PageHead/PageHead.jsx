import { useEffect } from "react";

export default function PageHead({ title = "MyCafe" }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null; // Tidak render elemen apa pun
}
