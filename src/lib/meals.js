import { el, empty } from "./elements.js";

export class MealSearcher {
  /**
   * @param {object} api API instance
   * @param {HTMLElement} baseElement Main container
   */
  constructor(api, baseElement) {
    this.api = api;
    this.baseElement = baseElement;
    this.searchId = 0;
  }

  /**
   * Creates and displays the search form.
   */
  renderSearch() {
    const input = el("input", {
      type: "text",
      placeholder: "Leita að uppskrift...",
    });

    const button = el(
      "button",
      {
        type: "submit",
      },
      "Leita",
    );

    const message = el("p");

    const form = el(
      "form",
      {
        submit: async (event) => {
          event.preventDefault();

          this.searchId += 1; // unique number
          const currentSearchId = this.searchId;

          const query = input.value.trim();

          this.baseElement.querySelector("ul")?.remove();

          if (query === "") {
            message.textContent = "Þú verður að slá inn leitarorð.";
            return;
          }

          message.textContent = "Verið er að leita...";

          try {
            const meals = await this.api.search(query);

            if (currentSearchId !== this.searchId) {
              return;
            }

            if (meals.length === 0) {
              message.textContent = "Engar uppskriftir fundust.";
              return;
            }

            message.textContent = `Fann ${meals.length} uppskriftir.`;

            const results = el("ul");

            for (const meal of meals) {
              const image = el("img", {
                src: meal.image,
                alt: meal.title,
                width: 100,
                height: 100,
              });

              const link = el(
                "a",
                {
                  href: `?id=${encodeURIComponent(meal.id)}`,
                },
                image,
                meal.title,
              );

              const item = el("li", {}, link);
              results.append(item);
            }

            this.baseElement.append(results);
          } catch (err) {
            if (currentSearchId !== this.searchId) {
              return;
            }

            message.textContent = "Villa kom upp við leit.";
            console.error(err);
          }
        },
      },
      input,
      button,
    );

    this.baseElement.append(form, message);
  }

  /**
   * Displays a single recipe.
   * @param {string} id Recipe ID.
   */
  async renderMeal(id) {
    const back = el("a", { href: "/" }, "Til baka");
    const message = el("p", {}, "Verið er að sækja uppskrift...");

    this.baseElement.append(back, message);

    try {
      const meal = await this.api.getMeal(id);

      if (meal === null) {
        message.textContent = "Uppskrift fannst ekki.";
        return;
      }

      message.remove();

      const title = el("h2", {}, meal.title);

      const image = el("img", {
        src: meal.image,
        alt: meal.title,
        width: 300,
      });

      const heading = el("h3", {}, "Hráefni");
      const ingredients = el("ul");

      for (const ingredient of meal.ingredients) {
        const item = el("li", {}, `${ingredient.measure} ${ingredient.name}`);

        ingredients.append(item);
      }

      const instructionsHeading = el("h3", {}, "Leiðbeiningar");
      const instructions = el("p", {}, meal.instructions);

      this.baseElement.append(
        title,
        image,
        heading,
        ingredients,
        instructionsHeading,
        instructions,
      );
    } catch (err) {
      message.textContent = "Villa kom upp við að sækja uppskrift.";
      console.error(err);
    }
  }

  /**
   * Displays search form or a specific recipe.
   * @param {string|null} id Recipe ID
   */
  render(id = null) {
    empty(this.baseElement);

    if (id === null) {
      this.renderSearch();
    } else {
      this.renderMeal(id);
    }
  }
}
