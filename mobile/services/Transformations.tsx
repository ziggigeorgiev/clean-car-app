export const Transformations = {
  transformServices: (services) => {
    // Step 1: Group services by category and calculate total price per category
    const groupedByCategory = services.reduce((acc, service) => {
        const { category, price, currency } = service;

        if (!acc[category]) {
        acc[category] = {
            totalPrice: 0,
            currency: currency, // Assuming currency is consistent within a category
            items: []
        };
        }
        acc[category].totalPrice += price;
        acc[category].items.push(service);
        return acc;
    }, {});

    // Step 2: Build the new structured list
    const transformedList: { name: string; price: number; currency: string; type: string }[] = [];

    // Iterate over the categories in the order they appear in the original list
    // To maintain original order of categories, we can get unique categories first
    const uniqueCategories = [...new Set(services.map(s => s.category))];

    const categoryName = {
        "Basic": "Basic cleaning",
        "Extra": "Extra services",
    }

    uniqueCategories.forEach(category => {
        const categoryData = groupedByCategory[category];

        // Add the "primary" category entry
        transformedList.push({
            name: categoryName[category] || category,
            price: parseFloat(categoryData.totalPrice.toFixed(2)), // Format to 2 decimal places
            currency: categoryData.currency,
            type: "primary",
        });

        // Add "secondary" entries for each service in the category
        categoryData.items.forEach(service => {
            transformedList.push({
                name: service.name,
                price: service.price,
                currency: service.currency,
                type: "secondary",
            });
        });
    });

    return transformedList;
  }
};