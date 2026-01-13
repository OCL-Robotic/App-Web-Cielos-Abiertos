
export interface Objective {
  description: string;
}

export interface Activity {
  title: string;
  description: string;
  duration: string;
  materials: string[];
}

export interface RubricItem {
  criterion: string;
  excellent: string;
  good: string;
  improvement: string;
}

export interface LessonPlan {
  id: string;
  topic: string;
  verse: string;
  audience: string;
  date: string;
  abcd: {
    audience: string;
    behavior: string;
    condition: string;
    degree: string;
  };
  generalObjective: string;
  specificObjectives: string[];
  activities: Activity[];
  rubric: RubricItem[];
  biblicalContext: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'select';
  options?: string[];
}

export type FormInputs = Record<string, string>;
