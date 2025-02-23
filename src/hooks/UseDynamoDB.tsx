import { PutItemCommand, ListTablesCommand, ScanCommand, GetItemCommand, UpdateItemCommand   } from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "../api/dynamoClient";

interface PutItemInput {
  [key: string]: { S: string } | { N: string };
}

const useDynamoDB = (tableName: string) => {
  const putItem = async (item: PutItemInput) => {
    const params = {
      TableName: tableName,
      Item: item,
    };

    try {
      const data = await dynamoClient.send(new PutItemCommand(params));
      console.log("Elemento agregado:", data);
    } catch (err) {
      console.error("Error al agregar el elemento:", err);
    }
  };

  const listItems = async () => {
    try {
      const data = await dynamoClient.send(new ListTablesCommand({}));
      console.log("Tablas disponibles:", data.TableNames);
      return data.TableNames;
    } catch (err) {
      console.error("Error al listar las tablas:", err);
      return [];
    }
  };

  const GetItems = async () => {
    try {
      const params = { TableName: tableName };
      const data = await dynamoClient.send(new ScanCommand(params));
      console.log(`Elementos en ${tableName}:`, data.Items);
      return data.Items;
    } catch (err) {
      console.error(`Error al escanear la tabla ${tableName}:`, err);
      return [];
    }
  };

    // 🟢 Obtener video por ID
    const getItem = async (id_video: string) => {
      const params = {
        TableName: tableName,
        Key: {
          id_video: { S: id_video },
        },
      };
  
      try {
        const data = await dynamoClient.send(new GetItemCommand(params));
        return data.Item ? data.Item : null;
      } catch (err) {
        console.error(`Error al obtener el video con ID ${id_video}:`, err);
        return null;
      }
    };
  
    // 🟢 Obtener videos con la misma etiqueta (video_tags)
    const getVideosByTag = async (video_tags: string) => {
      const params = {
        TableName: tableName,
        FilterExpression: "video_tags = :tag",
        ExpressionAttributeValues: {
          ":tag": { S: video_tags },
        },
      };
  
      try {
        const data = await dynamoClient.send(new ScanCommand(params));
        return data.Items ? data.Items : [];
      } catch (err) {
        console.error(`Error al obtener videos con la etiqueta ${video_tags}:`, err);
        return [];
      }
    };

    const addComment = async (id_video, comment) => {
      const formattedComment = `[${comment}]`;
      const params = {
        TableName: tableName,
        Key: {
          id_video: { S: id_video },
        },
        UpdateExpression: "SET video_comments = :comment",
        ExpressionAttributeValues: {
          ":comment": { S: formattedComment },
        },
      };
  
      try {
        await dynamoClient.send(new UpdateItemCommand(params));
        console.log(`Comentario agregado a ${id_video}: ${formattedComment}`);
      } catch (err) {
        console.error(`Error al agregar comentario a ${id_video}:`, err);
      }
    };
    
    
   

  return { putItem, listItems, GetItems, getItem, getVideosByTag, addComment };
};

export default useDynamoDB;
