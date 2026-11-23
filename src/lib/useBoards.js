import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/lib/useEntityList";
import { DEFAULT_BOARDS } from "@/lib/boardsSyllabus";

export function useBoards() {
  const { items, reload, setItems } = useEntityList("BoardTopic", {}, "order_index", 500);
  const seeding = useRef(false);

  useEffect(() => {
    if (!items || seeding.current) return;
    const missing = DEFAULT_BOARDS.filter(
      (topic) => !items.some((item) => item.subject === topic.subject && item.name === topic.name)
    );
    if (!missing.length) return;
    seeding.current = true;
    base44.entities.BoardTopic.bulkCreate(
      missing.map((topic, index) => ({
        ...topic,
        status: "Not Started",
        confidence: 0,
        revision_count: 0,
        order_index: items.length + index,
      }))
    )
      .then(() => reload())
      .catch(() => {
        seeding.current = false;
      });
  }, [items, reload]);

  return { topics: items, reload, setItems };
}