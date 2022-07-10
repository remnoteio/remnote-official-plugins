import { getRandomInt } from "./utils";

// mostly from: https://source.unsplash.com/random/600x600/?dog
const doggos = [
  "https://post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/02/322868_1100-800x825.jpg",
  "https://img-11.stickers.cloud/packs/a1636ee0-0869-4841-9b75-b9f89e9d69b5/webp/060689b6-5744-48a9-ad62-2c8e764808fc.webp",
  "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTcyOQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1599765625239-fe53131a58ee?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTgyOQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1592924728350-f7d4fd5d1655?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTg1Nw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/flagged/photo-1550973078-10a2d124c99c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTg3MA&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1598628461950-268968751a2e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTg4OA&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1583511666372-62fc211f8377?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTkwMw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1597633425046-08f5110420b5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTkxOQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTkzNA&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1521673461164-de300ebcfb17?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTk0Nw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTk1OA&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1554692901-e16f2046918a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTk2Nw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1579807351146-e6dd49462635?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTk4MQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNTk5NA&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjAwMg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjAwMg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1598875706250-21faaf804361?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjAyMg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1583091618471-56becbdb1c00?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjA0Mw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1568393691080-d016376b767d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjA1Nw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1529831129093-0fa4866281ee?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjA3NA&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1510771463146-e89e6e86560e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjEwMg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjExNQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjEyOQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1540411003967-af56b79be677?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjE0MQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1596490634801-c536934af56e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjE1MA&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjE4NQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
  "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixid=MnwxfDB8MXxyYW5kb218MHx8ZG9nfHx8fHx8MTY1MTgyNjE5Ng&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
];

export const randomDoggo = () => {
  const idx = getRandomInt(0, doggos.length - 1);
  return doggos[idx];
};
