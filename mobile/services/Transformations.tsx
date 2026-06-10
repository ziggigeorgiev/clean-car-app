export const Transformations = {

  transformServices: (services: any[]) => {
    const sortedServices = [...services].sort((a, b) => {
        // Primary sort: by 'type'
        // 'primary' should come before 'secondary'
        const categoryA = a.category === 'Basic' ? 0 : 1;
        const categoryB = b.category === 'Basic' ? 0 : 1;

        if (categoryA !== categoryB) {
            return categoryA - categoryB; // Sort by type (0 comes before 1)
        }

        // Secondary sort: if types are the same, sort by 'name' alphabetically
        // Use localeCompare for robust string comparison
        return a.name.localeCompare(b.name);
    }); 
    
    // Step 1: Group services by category and calculate total price per category.
    // `quantity` defaults to 1, so the car app (no quantities) is unaffected;
    // the home app passes a quantity per service and prices multiply.
    const groupedByCategory = sortedServices.reduce((acc, service) => {
        const { category, price, currency } = service;
        const quantity = service.quantity ?? 1;

        if (!acc[category]) {
        acc[category] = {
            totalPrice: 0,
            currency: currency, // Assuming currency is consistent within a category
            items: []
        };
        }
        acc[category].totalPrice += price * quantity;
        acc[category].items.push(service);
        return acc;
    }, {});

    // Step 2: Build the new structured list. Carries `serviceId` for
    // secondary rows and `categoryKey` for the aggregate primary row so the
    // renderer can resolve the right i18n key.
    const transformedList: {
      name: string;
      price: number;
      currency: string;
      type: 'primary' | 'secondary';
      serviceId?: number;
      categoryKey?: string;
      quantity?: number;
    }[] = [];

    // Iterate over the categories in the order they appear in the original list
    const uniqueCategories = [...new Set(sortedServices.map(s => s.category))];

    const categoryName: Record<string, string> = {
        "Basic": "Basic cleaning",
        "Extra": "Extra services",
    }

    uniqueCategories.forEach((category: string) => {

        const categoryData = groupedByCategory[category];

        // Add the "primary" category entry
        transformedList.push({
            name: categoryName[category] || category,
            price: parseFloat(categoryData.totalPrice.toFixed(2)),
            currency: categoryData.currency,
            type: "primary",
            categoryKey: (category || '').toLowerCase(),
        });

        // Add "secondary" entries for each service in the category
        categoryData.items.forEach((service: { id?: number; name: any; price: any; currency: any; quantity?: number; }) => {
            const quantity = service.quantity ?? 1;
            transformedList.push({
                name: service.name,
                price: service.price * quantity,
                currency: service.currency,
                type: "secondary",
                serviceId: service.id,
                quantity,
            });
        });
    });

    return transformedList;
  },

  transformProcessSteps: (processSteps: any[]) => {
    const transformedList: { id: any; name: any; text: any, status: any, updated_at: any; }[] = [];
    
    processSteps.sort((a, b) => a.id - b.id);
    processSteps.forEach((processStep) => {
        transformedList.push({
            id: processStep.id,
            name: processStep.name,
            text: processStep.text || "No description available", // Default text if not provide
            status: processStep.status,
            updated_at: processStep.updated_at || null // Optional field for updates
        });
    });

    return transformedList
  }
};