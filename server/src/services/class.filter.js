// Sort and fields are string so i shoulr exexute them from the obj
class Filter {
  constructor(query) {
    this.query = query;
  }

  filter() {
    const filterObj = { ...this.query };
    const excludeFileds = ["page", "limit", "sort", "fields"];
    excludeFileds.forEach((el) => delete filterObj[el]);

    //?duration[gte]=5&price[gte]=1000&fields=price
    let filter = JSON.stringify(filterObj); // make it string to replace gte gt lte lt to add $ before them
    filter = JSON.parse(
      filter.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`)
    );

    return filter;
  }

  fields() {
    // fields=name,price so this is string i need to make it array [name , price] then make it string without , so it be name price
    if (this.query.fields) {
      return this.query.fields.split(",").join(" ");
    } else
      return {
        __v: 0,
      };
  }
  // sort= -price,-ratingsAverage make it sort = -price -ratingsAverage
  sort(option = "") {
    if (this.query.sort) {
      return this.query.sort.split(",").join(" ");
    } else {
      return option;
    }
  }

  pagination() {
    // ?page=2&limit=4
    const DEFAULT_PAGE_NUMBER = 1;
    const DEFAULT_LIMIT = 0;
    const page = Math.abs(this.query.page) || DEFAULT_PAGE_NUMBER;
    const limit = Math.abs(this.query.limit) || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    return {
      limit,
      skip,
    };
  }
}

module.exports = Filter;
