import { getRandomInt } from "./utils";

export const motivations = [
  "Well done",
  "Bravo",
  "Congratulations",
  "Good",
  "Great",
  "Hooray",
  "Hurrah",
  "Good job",
  "There you go",
  "Good on you",
  "Great job",
  "Awesome work",
  "Good work",
  "Great work",
  "Take a bow",
  "Nice job",
  "Right on",
  "Keep it up",
  "Nice work",
  "Great effort",
  "Awesome",
];

export const randomMotivation = () => {
  const idx = getRandomInt(0, motivations.length - 1);
  return motivations[idx];
};
