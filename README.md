# Rehoboth Homes & Estate Management

This is a static HTML, CSS and JavaScript property catalogue. Open `index.html` in a browser to preview it. No build step or package installation is needed.

## Publish verified business details

Edit `properties.js`:

- `business.whatsappNumber`: WhatsApp number in international format, digits only, without `+` (for example, the country code followed by the number).
- `business.phoneNumber`: optional click-to-call number, digits only. If empty, the phone button is not shown.
- `business.xAccountUrl`: exact, verified X account URL. The footer link stays hidden until one is entered.
- `properties`: add only current listings whose details and images the business has confirmed.

Each property uses this structure:

```js
{
  id: "unique-url-friendly-id",
  title: "Verified property title",
  location: "Verified location",
  area: "Optional neighbourhood",
  type: "Land",
  status: "For Sale",
  availability: "Available",
  price: 10000000,
  pricePeriod: "optional for rentals",
  size: "Verified size",
  summary: "Short confirmed description",
  description: "Confirmed property description",
  images: ["https://..."],
  imageAlt: "Accurate description of the property photo",
  documentation: "Verified documentation information",
  features: ["Confirmed feature"],
  landmarks: ["Confirmed nearby landmark"]
}
```

Use one of these property types to match the catalogue filters: `Land`, `House` or `Houses`, `Commercial Property`, `Investment Opportunities`, `Property Development`, or `Rentals`. Use `For Sale` or `For Rent` for `status`; use a number for `price` to enable price filtering, or `priceText` for a non-numeric price display. The property detail URL is `?property=unique-url-friendly-id`.

Documentation is deliberately described as unprovided unless a verified `documentation` value is entered. Confirm all prices, availability, descriptions, documentation and image rights before publishing. The sample values above describe the data shape only; they are not real listings.