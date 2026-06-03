import type { ProfileCompleteness, ScreeningInput } from "@/types/screening";

const FIELD_WEIGHTS: Record<keyof Omit<ScreeningInput, "faceImageBase64" | "screeningMode">, number> = {
  fullName: 40,
  fathersName: 15,
  dateOfBirth: 20,
  address: 15,
};

const FACE_WEIGHT = 10;

export function calculateProfileCompleteness(input: ScreeningInput): ProfileCompleteness {
  if (input.screeningMode === "image_only") {
    if (input.faceImageBase64) {
      return {
        score: 100,
        filledFields: ["Face Photo (image-led search)"],
        missingFields: [],
      };
    }
    return {
      score: 0,
      filledFields: [],
      missingFields: ["Face Photo"],
    };
  }

  const filledFields: string[] = [];
  const missingFields: string[] = [];
  let score = 0;

  if (input.fullName?.trim()) {
    score += FIELD_WEIGHTS.fullName;
    filledFields.push("Full Name");
  } else {
    missingFields.push("Full Name");
  }

  if (input.fathersName?.trim()) {
    score += FIELD_WEIGHTS.fathersName;
    filledFields.push("Father's Name");
  } else {
    missingFields.push("Father's Name");
  }

  if (input.dateOfBirth?.trim()) {
    score += FIELD_WEIGHTS.dateOfBirth;
    filledFields.push("Date of Birth");
  } else {
    missingFields.push("Date of Birth");
  }

  if (input.address?.trim()) {
    score += FIELD_WEIGHTS.address;
    filledFields.push("Address");
  } else {
    missingFields.push("Address");
  }

  if (input.faceImageBase64) {
    score += FACE_WEIGHT;
    filledFields.push("Face Photo");
  } else {
    missingFields.push("Face Photo");
  }

  return { score: Math.min(100, score), filledFields, missingFields };
}
