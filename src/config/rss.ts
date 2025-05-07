import Parser from "rss-parser";
let parser = new Parser();

export const getFeed = async () => {
  let feed = await parser.parseURL("http://rss.cnn.com/rss/cnn_topstories.rss");

  const docs: string[] = [];
  const metadatas: { url: string }[] = [];
  const ids: string[] = [];
  
 feed.items.map((item: any,i) => {
    const itemString = `
    Title :- ${item.title}
    Published Date :- ${item.pubDate}
    Link :- ${item.link}
    Content :- ${item.content}
    `
    const metaData = {
      url: item.link as string
    }
    const id = ""+(i+1);
    docs.push(itemString);
    metadatas.push(metaData);
    ids.push(id);
  });

  return { docs, metadatas, ids };
};
