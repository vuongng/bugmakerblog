/* Vendor imports */
const path = require('path');
/* App imports */
const config = require('./config');
const utils = require('./src/utils/pageUtils');
const { createFilePath } = require('gatsby-source-filesystem');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  return graphql(`
    {
      allMarkdownRemark(sort: {order: DESC, fields: [frontmatter___date]}) {
        edges {
          node {
            frontmatter {
              tags
              date(formatString: "YYYY-DD-MM")
            }
            fields {
              slug
            }
            fileAbsolutePath
          }
        }
      }
    }    
  `).then((result) => {
    if (result.errors) return Promise.reject(result.errors);

    const { allMarkdownRemark } = result.data;
    /* Post pages */
    allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.fields.slug,
        component: path.resolve('src/templates/post/post.jsx'),
        context: {
          slug: node.fields.slug
        },
      });
    });

    return 1;
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  if (node.internal.type !== "MarkdownRemark") return;
  const { permalink, date } = node.frontmatter;
  const { createNodeField } = actions;
  const slug = permalink || createFilePath({ node, getNode });

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date)).split("/").join("-");
  
  createNodeField({
    node,
    name: 'slug',
    value: `blog${slug}`.replace(/\/(?=[^\/]*$)/, ''),
  })
}
