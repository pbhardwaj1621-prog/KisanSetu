// नमूना (SAMPLE) data। असली data बैकएंड से आएगा, पर उसका रूप यही रहेगा।
const govData = {
  date: "SAMPLE DATA",
  prices: {
    wheat:  { Mathura:{min:2350,max:2450}, Chhata:{min:2380,max:2500}, Kosi:{min:2300,max:2450}, Agra:{min:2420,max:2580} },
    rice:   { Mathura:{min:3700,max:3900}, Chhata:{min:3650,max:3850}, Kosi:{min:3800,max:4000}, Agra:{min:3750,max:3950} },
    tomato: { Mathura:{min:1700,max:1900}, Chhata:{min:1800,max:2000}, Kosi:{min:1650,max:1850}, Agra:{min:1900,max:2100} },
    onion:  { Mathura:{min:1600,max:1800}, Chhata:{min:1550,max:1750}, Kosi:{min:1700,max:1900}, Agra:{min:1650,max:1850} },
    potato: { Mathura:{min:1200,max:1400}, Chhata:{min:1250,max:1450}, Kosi:{min:1180,max:1380}, Agra:{min:1300,max:1500} }
  }
};