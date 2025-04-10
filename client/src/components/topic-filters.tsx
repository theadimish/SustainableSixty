import { ScrollArea } from "@/components/ui/scroll-area";

interface TopicFiltersProps {
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
}

const topics = [
  { id: "all", label: "All" },
  { id: "energy", label: "Energy" },
  { id: "waste", label: "Waste" },
  { id: "biodiversity", label: "Biodiversity" },
  { id: "conservation", label: "Conservation" },
  { id: "climate", label: "Climate" },
];

export default function TopicFilters({ selectedTopic, onSelectTopic }: TopicFiltersProps) {
  return (
    <div className="bg-white border-b border-neutral-light py-2 px-4">
      <ScrollArea className="w-full">
        <div className="flex space-x-2 whitespace-nowrap">
          {topics.map(topic => (
            <button
              key={topic.id}
              className={`px-4 py-1 rounded-full text-sm font-accent ${
                selectedTopic === topic.id 
                  ? "bg-primary text-white" 
                  : "bg-neutral-lightest border border-neutral-light text-neutral-dark"
              }`}
              onClick={() => onSelectTopic(topic.id)}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
