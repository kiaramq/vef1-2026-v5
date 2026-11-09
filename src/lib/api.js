import { sleep, error } from "./helpers.js";

/** Hámarksfjöldi hráefna í svari frá API. */
const MAX_INGREDIENTS = 20;

export class MealApi {
  /**
   * @param {string} baseUrl API base url.
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  /**
   *
   * @param {string} query Search term.
   * @returns {Promise<Array>} List of recipes.
   */

  async search(query) {
    if (query.toLowerCase().includes("slow")) {
      await sleep(3);
    }

    if (query.toLowerCase().includes("error")) {
      error("Villa við að sækja uppskriftir.");
    }

    const url = `${this.baseUrl}search.php?s=${encodeURIComponent(query)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Ekki tókst að sækja gögn.");
    }

    const data = await response.json();

    if (!data || !Object.hasOwn(data, "meals")) {
      throw new Error("Ógilt svar frá API.");
    }

    if (data.meals === null) {
      return [];
    }

    if (!Array.isArray(data.meals)) {
      throw new Error("Ógilt form á uppskriftum.");
    }

    return data.meals.map((meal) => {
      if (
        !meal ||
        typeof meal.idMeal !== "string" ||
        typeof meal.strMeal !== "string" ||
        typeof meal.strMealThumb !== "string"
      ) {
        throw new Error("Ógild uppskriftargögn.");
      }

      const ingredients = [];

      for (let i = 1; i <= MAX_INGREDIENTS; i += 1) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (typeof ingredient === "string" && ingredient.trim()) {
          ingredients.push({
            name: ingredient.trim(),
            measure: typeof measure === "string" ? measure.trim() : "",
          });
        }
      }

      return {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        instructions:
          typeof meal.strInstructions === "string" ? meal.strInstructions : "",
        ingredients,
      };
    });
  }

  /**
   *
   * @param {string} id The recipe ID.
   * @returns {Promise<object|null>} Recipe data or null if not found.
   */

  async getMeal(id) {
    const url = `${this.baseUrl}lookup.php?i=${encodeURIComponent(id)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Ekki tókst að sækja uppskrift.");
    }

    const data = await response.json();

    if (!data || !Object.hasOwn(data, "meals")) {
      throw new Error("Ógilt svar frá API.");
    }

    if (data.meals === null || data.meals === "Invalid ID") {
      return null;
    }

    if (!Array.isArray(data.meals) || data.meals.length === 0) {
      throw new Error("Ógild uppskriftargögn.");
    }

    const meal = data.meals[0];

    if (
      !meal ||
      typeof meal.idMeal !== "string" ||
      typeof meal.strMeal !== "string" ||
      typeof meal.strMealThumb !== "string" ||
      typeof meal.strInstructions !== "string"
    ) {
      throw new Error("Ógild uppskriftargögn.");
    }
    const ingredients = [];

    for (let i = 1; i <= 20; i += 1) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (typeof ingredient === "string" && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          measure: typeof measure === "string" ? measure.trim() : "",
        });
      }
    }

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      instructions: meal.strInstructions,
      ingredients,
    };
  }
}
