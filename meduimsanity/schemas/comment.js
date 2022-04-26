export default {
    name: "comment",
    type: "document",
    title: "Comment",
    fields: [
        {
            name: "name",
            type:  "string"
        },
        {
            name: "email",
            type:  "string"
        },
        {
            name: "comment",
            type:  "text"
        },
        {
            name: "pproved",
            type:  "boolean",
            title: "Approved",
            description: "Comments won't show on the sit witout approval"
        },
        {
            name: "post",
            type:  "reference",
            to: [{type: "post"}],
        },
    ],
}